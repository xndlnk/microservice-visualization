package de.maibornwolff.tadis;


import java.util.function.Consumer;
import javax.swing.JComponent;

public interface BrowserView {
    public void init();
    public void load(String url);
    public void reload();
    public void urlChangeCallback(Consumer<String> consumer);
    public JComponent getNode();
}
