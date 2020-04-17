package de.maibornwolff.tadis;

import java.security.GeneralSecurityException;
import java.util.function.Consumer;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import javax.swing.JComponent;
import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;

public class JavaFxBrowserView implements BrowserView {

    private static final String userAgent = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0";

    private WebView browser;
    private WebEngine webEngine;
    private String url;

    private JFXPanel jfxPanel;

    static {
        // https://stackoverflow.com/questions/22605701/javafx-webview-not-working-using-a-untrusted-ssl-certificate
        // Create a trust manager that does not validate certificate chains
        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }

                    public void checkClientTrusted(
                            java.security.cert.X509Certificate[] certs, String authType) {
                    }

                    public void checkServerTrusted(
                            java.security.cert.X509Certificate[] certs, String authType) {
                    }
                }
        };

        // Install the all-trusting trust manager
        try {
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (GeneralSecurityException e) {
        }
    }


    public JavaFxBrowserView() {
    }


    @Override
    public void init() {
        reload();
    }

    @Override
    public void load(String url) {
        Platform.runLater(() -> {
            webEngine.load(url);
        });
    }

    @Override
    public void reload() {
        jfxPanel = new JFXPanel();
        Platform.setImplicitExit(false);
        Platform.runLater(() -> {
            browser = new WebView();
            webEngine = browser.getEngine();
            webEngine.setUserAgent(userAgent);
        });
    }

    @Override
    public void urlChangeCallback(Consumer<String> consumer) {
        Platform.setImplicitExit(false);
        Platform.runLater(() -> {
            webEngine.getLoadWorker().stateProperty().addListener((ov, oldState, newState) -> {
                consumer.accept(webEngine.getLocation());
            });
        });
    }

    @Override
    public JComponent getNode() {
        Platform.setImplicitExit(false);
        Platform.runLater(() -> {
            BorderPane borderPane = new BorderPane();
            borderPane.setCenter(browser);
            Scene scene = new Scene(borderPane);
            jfxPanel.setScene(scene);
        });

        return jfxPanel;
    }
}
