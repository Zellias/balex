package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"
)

// BridgeRequest represents an IPC / RPC request to the BaleX Node engine
type BridgeRequest struct {
	ID     int         `json:"id"`
	Action string      `json:"action,omitempty"`
	Method string      `json:"method,omitempty"`
	Token  string      `json:"token,omitempty"`
	Config interface{} `json:"config,omitempty"`
	Params interface{} `json:"params,omitempty"`
}

// BridgeResponse represents an IPC / RPC response from the BaleX Node engine
type BridgeResponse struct {
	ID      int             `json:"id,omitempty"`
	Success bool            `json:"success,omitempty"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   string          `json:"error,omitempty"`
	Event   string          `json:"event,omitempty"`
	Data    json.RawMessage `json:"data,omitempty"`
}

// ============================================================================
// Approach 1: STDIO Subprocess Bridge (Fastest, zero ports, directly spawned by Go)
// ============================================================================

type StdioBridge struct {
	cmd    *exec.Cmd
	stdin  io.WriteCloser
	reader *bufio.Reader
	seq    int
}

// NewStdioBridge spawns the Node.js bridge as a child process
func NewStdioBridge(nodePath string, bridgeScriptPath string) (*StdioBridge, error) {
	cmd := exec.Command(nodePath, bridgeScriptPath, "--stdio")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to open stdin: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to open stdout: %w", err)
	}

	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start node process: %w", err)
	}

	b := &StdioBridge{
		cmd:    cmd,
		stdin:  stdin,
		reader: bufio.NewReader(stdout),
	}

	// Read initial ready event
	line, err := b.reader.ReadBytes('\n')
	if err == nil {
		fmt.Printf("[Go] Bridge connected: %s", string(line))
	}

	return b, nil
}

// SendCommand sends a JSON-RPC request to the Node process and returns the response
func (b *StdioBridge) SendCommand(action string, method string, params interface{}) (*BridgeResponse, error) {
	b.seq++
	req := BridgeRequest{
		ID:     b.seq,
		Action: action,
		Method: method,
		Params: params,
	}

	data, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	if _, err := b.stdin.Write(append(data, '\n')); err != nil {
		return nil, err
	}

	// Read reply line
	line, err := b.reader.ReadBytes('\n')
	if err != nil {
		return nil, err
	}

	var resp BridgeResponse
	if err := json.Unmarshal(line, &resp); err != nil {
		return nil, err
	}

	return &resp, nil
}

// Close terminates the child process
func (b *StdioBridge) Close() error {
	b.stdin.Close()
	return b.cmd.Process.Kill()
}

// ============================================================================
// Approach 2: HTTP Client (For microservices where Bridge runs as a daemon)
// ============================================================================

type HTTPBridge struct {
	BaseURL string
	client  *http.Client
}

func NewHTTPBridge(baseURL string) *HTTPBridge {
	return &HTTPBridge{
		BaseURL: baseURL,
		client:  &http.Client{Timeout: 10 * time.Second},
	}
}

func (h *HTTPBridge) Call(method string, params interface{}) (*BridgeResponse, error) {
	payload := map[string]interface{}{
		"method": method,
		"params": params,
	}
	body, _ := json.Marshal(payload)

	resp, err := h.client.Post(h.BaseURL+"/api/call", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var bridgeResp BridgeResponse
	if err := json.Unmarshal(respBytes, &bridgeResp); err != nil {
		return nil, err
	}

	return &bridgeResp, nil
}

func main() {
	fmt.Println("🚀 BaleX Go (Golang) Bridge Integration Example")
	fmt.Println("-----------------------------------------------")

	// Example 1: Calling via STDIO Bridge
	bridge, err := NewStdioBridge("node", "../../src/bridge.js")
	if err != nil {
		log.Printf("Stdio bridge note: %v (Node process can also be run independently)", err)
	} else {
		defer bridge.Close()

		// 1. Ping the bridge
		res, err := bridge.SendCommand("ping", "", nil)
		if err == nil {
			fmt.Printf("✅ Ping Response from Node: %s\n", string(res.Result))
		}

		// 2. Initialize official Bot
		// res, err = bridge.SendCommand("init_bot", "", map[string]string{
		// 	"token": "YOUR_BALE_BOT_TOKEN",
		// })

		// 3. Send message
		// res, err = bridge.SendCommand("call", "sendMessage", []interface{}{
		// 	123456789, // peerId
		// 	"سلام از زبان گو (Golang)!",
		// })
	}

	// Example 2: Calling via HTTP Bridge (if running `node src/bridge.js --port 8765`)
	httpBridge := NewHTTPBridge("http://127.0.0.1:8765")
	fmt.Println("\nTo use HTTP mode in Go, run the bridge server:")
	fmt.Println("  node src/bridge.js --port 8765")
	fmt.Println("Then in Go: httpBridge.Call(\"sendMessage\", []interface{}{peerId, text})")
	_ = httpBridge
}
