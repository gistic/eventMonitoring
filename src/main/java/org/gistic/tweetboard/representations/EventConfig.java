package org.gistic.tweetboard.representations;

/**
 * Created by Osama-GIS on 4/19/2015.
 */
public class EventConfig {
    private String backgroundColor;
    private String[] screens;
    private String size;

    public String getSize() {
        return size;
    }
    public void setSize(String size) {
        this.size = size;
    }

    public String[] getScreens() {
        return screens;
    }
    public void setScreens(String[] screens) {
        this.screens = screens;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }
    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
}
