package com.zakorchook.wetherapp.dialogs;

import android.app.AlertDialog;
import android.app.Dialog;
import android.support.v4.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;

import com.zakorchook.wetherapp.R;

/**
 * Created by Мишаня on 29.05.2016
 */
public class ErrorDialog extends DialogFragment {

    public static ErrorDialog newInstance() {
        Bundle args = new Bundle();

        ErrorDialog fragment = new ErrorDialog();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(getActivity());
//        alertDialogBuilder.setTitle(R.string.error)
//                .setMessage(R.string.try_later)
        alertDialogBuilder.setTitle("Ошибка подключения!")
                .setMessage("Проверте подключение к интернету, и повторите попытку позже.")
                .setNeutralButton("Повторить", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dismiss();
                    }
                });
        return alertDialogBuilder.create();
    }
}
