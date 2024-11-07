import 'package:flutter/material.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String icon;
  final VoidCallback onAccountTap;
  final VoidCallback onSubscriptionTap;

  const CustomAppBar({
    super.key,
    required this.title,
    required this.icon,
    required this.onAccountTap,
    required this.onSubscriptionTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: const Color(0xFF1A1A1A),
      title: Row(
        children: [
          Image.asset(
            icon,
            width: 30,
            height: 30,
          ),
          const SizedBox(width: 10),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontFamily: 'Vazir',
              fontSize: 16,
            ),
          ),
          const Spacer(),
          TextButton.icon(
            onPressed: onSubscriptionTap,
            icon: const Icon(
              Icons.shopping_bag,
              color: Colors.yellow,
            ),
            label: const Text(
              'خرید اشتراک',
              style: TextStyle(
                color: Colors.yellow,
                fontFamily: 'Vazir',
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.account_circle, color: Colors.yellow),
            onPressed: onAccountTap,
          ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
