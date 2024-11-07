import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:afsoone_mobile/widgets/bottom_nav_bar.dart';
import 'package:afsoone_mobile/widgets/custom_app_bar.dart';
import 'package:afsoone_mobile/widgets/loading_animation.dart';
import 'package:afsoone_mobile/widgets/no_internet_page.dart';
import 'package:afsoone_mobile/utils/theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Afsoone',
      theme: appTheme,
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  late WebViewController _controller;
  bool _isLoading = false;
  String? _sessionCookie;
  bool _hasInternet = true;
  late AnimationController _animationController;
  late Animation<double> _animation;

  final List<String> _urls = [
    'https://www.afsoone.com',
    'https://www.afsoone.com/Animation',
    'https://www.afsoone.com/digital-book',
    'https://www.afsoone.com/music',
    'https://www.afsoone.com/adults',
    'https://www.afsoone.com/web-game',
    'https://www.afsoone.com/sargarmi',
    'https://afsoone.com/sub',
  ];

  final List<String> _initialUrls = [
    'https://www.afsoone.com',
    'https://www.afsoone.com/Animation',
    'https://www.afsoone.com/digital-book',
    'https://www.afsoone.com/music',
    'https://www.afsoone.com/adults',
    'https://www.afsoone.com/web-game',
    'https://www.afsoone.com/sargarmi',
    'https://afsoone.com/sub',
  ];

  @override
  void initState() {
    super.initState();
    _loadSessionCookie();
    _checkInternetConnection();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(_animationController);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadSessionCookie() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _sessionCookie = prefs.getString('user_session');
    });
  }

  Future<void> _saveSessionCookie(String cookie) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_session', cookie);
  }

  Future<void> _checkInternetConnection() async {
    var connectivityResult = await (Connectivity().checkConnectivity());
    setState(() {
      _hasInternet = connectivityResult != ConnectivityResult.none;
    });
  }

  void _startLoading() {
    if (!_isLoading) {
      setState(() {
        _isLoading = true;
      });
      _animationController.forward();
    }
  }

  void _stopLoading() {
    if (_isLoading) {
      _animationController.reverse().then((_) {
        setState(() {
          _isLoading = false;
        });
      });
    }
  }

  Future<bool> _onWillPop() async {
    if (await _controller.canGoBack()) {
      _controller.goBack();
      return false;
    }
    return true;
  }

  void _onTabTapped(int index) {
    if (_currentIndex == index) {
      _startLoading();
      _controller.loadUrl(_initialUrls[index]);
    } else {
      _startLoading();
      setState(() {
        _currentIndex = index;
      });
      _controller.loadUrl(_urls[index]);
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: CustomAppBar(
          title: 'افسونه',
          icon: 'assets/afsoone.ico',
          onAccountTap: () {
            _startLoading();
            _controller.loadUrl('https://www.afsoone.com/my-account/');
          },
          onSubscriptionTap: () {
            _startLoading();
            _controller.loadUrl('https://afsoone.com/sub');
          },
        ),
        body: _hasInternet ? _buildWebView() : const NoInternetPage(),
        bottomNavigationBar: BottomNavBar(
          currentIndex: _currentIndex,
          onTap: _onTabTapped,
        ),
      ),
    );
  }

  Widget _buildWebView() {
    return Stack(
      children: [
        WebView(
          initialUrl: _urls[_currentIndex],
          javascriptMode: JavascriptMode.unrestricted,
          onWebViewCreated: (WebViewController webViewController) {
            _controller = webViewController;
          },
          onPageStarted: (String url) {
            _startLoading(); // Start loading animation when page starts loading
          },
          onPageFinished: (String url) {
            _stopLoading(); // Stop loading animation when page finishes loading
            _controller.runJavascript('''(function() {
              const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith('d_user_session='))
                ?.split('=')[1];
              if (cookieValue) {
                window.flutter_inappwebview.callHandler('onCookieFound', cookieValue);
              }
            })();''');
          },
          navigationDelegate: (NavigationRequest request) {
            if (request.isForMainFrame) {
              _startLoading();
              return NavigationDecision.navigate;
            } else {
              _controller.loadUrl(request.url);
              return NavigationDecision.prevent;
            }
          },
          javascriptChannels: {
            JavascriptChannel(
              name: 'onCookieFound',
              onMessageReceived: (JavascriptMessage message) {
                _saveSessionCookie(message.message);
              },
            ),
          },
        ),
        if (_isLoading)
          FadeTransition(
            opacity: _animation,
            child: const LoadingAnimation(),
          ),
      ],
    );
  }
}
