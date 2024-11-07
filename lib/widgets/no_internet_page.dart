import 'package:flutter/material.dart';

class NoInternetPage extends StatelessWidget {
  const NoInternetPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF4B0082),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/afsoone.ico',
              width: 100,
              height: 100,
            ),
            const SizedBox(height: 20),
            const Text(
              'مشکل اتصال به اینترنت',
              style: TextStyle(
                color: Color(0xFFFFD700),
                fontFamily: 'Vazir',
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFFFFD700),
                fontFamily: 'Vazir',
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Implement retry logic here
              },
              style: ElevatedButton.styleFrom(
                foregroundColor: const Color(0xFF4B0082), backgroundColor: const Color(0xFFFFD700),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              child: const Text(
                'تلاش مجدد',
                style: TextStyle(
                  fontFamily: 'Vazir',
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
