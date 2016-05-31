package com.zakorchook.weatherapp.dialogs;

import android.app.AlertDialog;
import android.app.Dialog;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;

import com.zakorchook.weatherapp.R;
import com.zakorchook.weatherapp.RestClient;
import com.zakorchook.weatherapp.util.MyConstants;

import java.util.Locale;

/**
 * Created by Мишаня on 29.05.2016
 */
public class ErrorDialog extends DialogFragment {

    private static final String KEY = "currentCity";
    private String currentCity;

    public static ErrorDialog newInstance(String currentCity) {
        Bundle args = new Bundle();
        args.putString(KEY, currentCity);
        ErrorDialog fragment = new ErrorDialog();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if(getArguments() != null){
            currentCity = getArguments().getString(KEY, MyConstants.KIEV);
        }
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(getActivity());
        alertDialogBuilder.setTitle(R.string.error)
                .setMessage(R.string.try_later)
                .setNeutralButton(R.string.repeat, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        RestClient.getInstance().getDataByCity(currentCity, Locale.getDefault().getLanguage());
                    }
                });
        return alertDialogBuilder.create();
    }
}
