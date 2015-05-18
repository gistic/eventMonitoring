package org.gistic.tweetboard.representations;

/**
 * Created by osama-hussain on 5/18/15.
 */
public class GenericArray<T> {

    private T[] items;

    public GenericArray(T[] items) {
        this.items = items;
    }

    public T[] getItems() {
        return items;
    }

    public void setItems(T[] items) {
        this.items = items;
    }
}
