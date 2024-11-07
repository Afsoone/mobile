import 'package:flutter/material.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  BottomNavBar({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.fixed,
      items: [
        _buildNavItem(Icons.home, 'خانه'),
        _buildNavItem(Icons.movie, 'انیمیشن'),
        _buildNavItem(Icons.book, 'کتابخانه'),
        _buildNavItem(Icons.headset, 'پادکست'),
        _buildNavItem(Icons.people, 'والدین'),
        _buildNavItem(Icons.web, 'بازی'),
        _buildNavItem(Icons.emoji_events, 'سرگرمی'),
      ],
      selectedItemColor: Colors.white,
      unselectedItemColor: Colors.grey,
      selectedLabelStyle: const TextStyle(
        fontFamily: 'Vazir',
        fontSize: 14,
        color: Colors.white,
      ),
      unselectedLabelStyle: const TextStyle(
        fontFamily: 'Vazir',
        fontSize: 14,
        color: Colors.grey,
      ),
      backgroundColor: const Color(0xFF1A1A1A),
    );
  }

  BottomNavigationBarItem _buildNavItem(IconData icon, String label) {
    return BottomNavigationBarItem(
      icon: Icon(icon),
      label: label,
    );
  }

  BottomNavigationBarItem _buildSubNavItem(
      IconData icon, String label, List<String> subLabels) {
    return BottomNavigationBarItem(
      icon: Icon(icon),
      label: label,
      activeIcon: PopupMenuButton<int>(
        icon: Icon(Icons.arrow_drop_down, color: Colors.white),
        onSelected: (index) {
          onTap(4 + index);
        },
        itemBuilder: (context) => [
          for (int i = 0; i < subLabels.length; i++)
            PopupMenuItem<int>(
              value: i,
              child: Text(subLabels[i]),
            ),
        ],
        color: const Color(0xFF1A1A1A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        elevation: 8,
      ),
    );
  }
}
