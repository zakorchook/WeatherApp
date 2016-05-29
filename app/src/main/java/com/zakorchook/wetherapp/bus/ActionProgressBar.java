package com.zakorchook.wetherapp.bus;

/**
 * Created by Мишаня on 29.05.2016
 */
public class ActionProgressBar {
    public final boolean show;
    public final boolean isFail;

    public ActionProgressBar(boolean show, boolean isFail){
        this.show = show;
        this.isFail = isFail;
    }
}
