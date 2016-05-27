package com.zakorchook.wetherapp;

import android.content.Context;
import android.util.Log;

import com.squareup.okhttp.Callback;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.Response;
import com.zakorchook.wetherapp.models.WeatherData;

import org.greenrobot.eventbus.EventBus;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

/**
 * Created by Developer Zaharchuk Mihail on 5/27/2016
 */
public class RestClient {


    private static final String ROOT_URL = "http://api.openweathermap.org/";
    private static OkHttpClient client;
    private static RestClient instance;

    public static RestClient getInstance(Context context) {
        if (instance == null && context != null) {
            setupRestClient();
        }
        return instance;
    }

    public static RestClient getInstance() {
        return instance;
    }

    private static void setupRestClient() {

        client = new OkHttpClient();

        client.setReadTimeout(10, TimeUnit.SECONDS);
        client.setConnectTimeout(10, TimeUnit.SECONDS);
        instance = new RestClient();
    }

    public void getDataBySity(String sity){
        final Request request = new Request.Builder()
                .header("Accept", "text/plain")
                .url(doUrl(10, 0, ROOT_URL, "book")).build();
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Request request, IOException e) {

            }

            @Override
            public void onResponse(Response response) throws IOException {
                if(response.isSuccessful()){
                    try {
                        JSONObject object = new JSONObject(response.body().string());
                        EventBus.getDefault().post(getWeatherDataFromJson());

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                } else {

                }
            }
        });
    }

    private String doUrl(int i, int i1, String rootUrl, String book) {
        return ROOT_URL;
    }

    private WeatherData getWeatherDataFromJson(){
        return null;
    }
}
