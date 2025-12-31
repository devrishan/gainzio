package com.gainzio.app

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Message
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    // Primary URL - production
    private val BASE_URL = "https://gainzio.vercel.app"
    // Allowed hosts for internal navigation
    private val ALLOWED_HOSTS = listOf("gainzio.vercel.app", "accounts.google.com")

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Install Splash Screen (Must be before super.onCreate)
        installSplashScreen()
        
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        setupWebView()
        handleIntent(intent)
        setupBackNavigation()
        
        if (savedInstanceState == null) {
            webView.loadUrl(BASE_URL)
        }
    }

    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            javaScriptCanOpenWindowsAutomatically = true
            supportMultipleWindows() // Support for OAuth popups if needed
            userAgentString = userAgentString.replace("; wv", "") // Identify as standard browser if needed
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW // Enforce HTTPS
            
            // Zoom controls
            builtInZoomControls = false
            displayZoomControls = false
        }

        // Cookie Manager for persistent sessions
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url.toString()
                val host = request?.url?.host

                if (host != null && (host == "gainzio.vercel.app" || host.endsWith(".gainzio.vercel.app") || host.contains("google.com"))) {
                    // Internal navigation
                    return false 
                }

                // External links (Discord, Twitter, etc.) open in system browser
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                return true
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            // Handle new windows (typically for OAuth popups)
            override fun onCreateWindow(view: WebView?, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message?): Boolean {
                val newWebView = WebView(this@MainActivity)
                newWebView.settings.javaScriptEnabled = true
                newWebView.webChromeClient = this
                newWebView.webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                         val url = request?.url.toString()
                         // If popup redirects back to our app, close popup and load in main WebView
                         if (url.startsWith(BASE_URL)) {
                             webView.loadUrl(url)
                             newWebView.destroy()
                             return true
                         }
                         return false
                    }
                }
                
                // Dialog handling logic would go here if specialized popup UI is desired
                // For simplicity, we might just load in the main view or system browser if complex
                
                // Ideally for robust OAuth with popups inside WebView, a dialog or a new Activity is best
                // For this simple implementation, let's allow the transport to handle it or open in system browser if complex
                
                // Changing strategy: Open OAuth directly in WebView usually works if userAgent is correct
                // If a popup is strictly required, more complex logic is needed.
                // For now, let's return false so it loads in current webview or is handled by shouldOverrideUrlLoading
                return false
            }
        }
    }

    private fun handleIntent(intent: Intent?) {
        val data: Uri? = intent?.data
        if (data != null) {
            // Deep linking handling
            webView.loadUrl(data.toString())
        }
    }
    
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }
}
