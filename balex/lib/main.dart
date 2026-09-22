import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/discord_theme.dart';
import 'providers/chat_provider.dart';
import 'providers/bank_provider.dart';
import 'providers/settings_provider.dart';
import 'providers/bale_client_provider.dart';
import 'ui/layout/discord_scaffold.dart';
import 'ui/auth/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Never block the first Android frame on a request to fonts.gstatic.com.
  // BaleX ships with system fallbacks and must remain usable offline.
  GoogleFonts.config.allowRuntimeFetching = false;
  FlutterError.onError = (details) => FlutterError.presentError(details);
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  runApp(const BaleXApp());
}

class BaleXApp extends StatelessWidget {
  const BaleXApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SettingsProvider()),
        ChangeNotifierProvider(create: (_) => BankProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => BaleClientProvider()),
      ],
      child: MaterialApp(
        title: 'BaleX',
        debugShowCheckedModeBanner: false,
        theme: DiscordTheme.darkTheme,
        locale: const Locale('fa'),
        supportedLocales: const [Locale('fa'), Locale('en')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
        ],
        builder: (context, child) => Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        ),
        home: const _MessageBridge(),
      ),
    );
  }
}

class _MessageBridge extends StatefulWidget {
  const _MessageBridge();

  @override
  State<_MessageBridge> createState() => _MessageBridgeState();
}

class _MessageBridgeState extends State<_MessageBridge> {
  late final BaleClientProvider _client;

  @override
  void initState() {
    super.initState();
    _client = context.read<BaleClientProvider>();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _client.addListener(_consume);
      // A restored session may have completed LoadDialogs before this bridge
      // mounted. Consume the buffered page immediately as well.
      _consume();
    });
  }

  void _consume() {
    final client = context.read<BaleClientProvider>();
    final chats = context.read<ChatProvider>();
    if (client.isAuthenticated && !client.isSandboxMode) {
      chats.useRealAccount();
    }
    final dialogs = client.takeLastDialogsPage();
    if (dialogs != null && client.isAuthenticated && !client.isSandboxMode) {
      chats.replaceWithBaleDialogs(dialogs);
    }
    final message = client.takeLastIncomingMessage();
    if (message != null && mounted) {
      chats.receiveBaleMessage(message, currentUserId: client.user?.id ?? -1);
    }
  }

  @override
  void dispose() {
    _client.removeListener(_consume);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<BaleClientProvider>(
      builder: (context, baleClient, _) {
            if (baleClient.isAuthenticated || baleClient.isSandboxMode) {
              return const DiscordScaffold();
            }
            return const LoginScreen();
          },
    );
  }
}
