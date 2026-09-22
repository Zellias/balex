enum UserStatus { online, idle, dnd, offline }

class UserModel {
  final int id;
  final String name;
  final String? username;
  final String? phone;
  final String? avatarUrl;
  final UserStatus status;
  final String? customStatus;
  final bool isBot;
  final String? roleBadge; // [Owner], [Admin], [BaleX Pro], [Bot]
  final bool isMe;

  const UserModel({
    required this.id,
    required this.name,
    this.username,
    this.phone,
    this.avatarUrl,
    this.status = UserStatus.online,
    this.customStatus,
    this.isBot = false,
    this.roleBadge,
    this.isMe = false,
  });

  UserModel copyWith({
    String? name,
    String? username,
    String? phone,
    String? avatarUrl,
    UserStatus? status,
    String? customStatus,
    String? roleBadge,
  }) {
    return UserModel(
      id: id,
      name: name ?? this.name,
      username: username ?? this.username,
      phone: phone ?? this.phone,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      status: status ?? this.status,
      customStatus: customStatus ?? this.customStatus,
      isBot: isBot,
      roleBadge: roleBadge ?? this.roleBadge,
      isMe: isMe,
    );
  }
}
