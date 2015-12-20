---
layout: post
title: Android JNI 基础篇
description: 安卓JNI 实现java调用C/C++
keywords: Android JNI 基础篇
categories: [graduationi, android]
tags : [graduation, android]
---

一步一步来，慢慢来研究下JNI。 

课题论文涉及到要跑多核多线程的benchmark，最好能体现coherence miss多的benchmark，但是就目前的情况，大部分安卓benchmark并没有充分多核多线程的优势。但是，linux的benchmark parsec3.0，很多测试集都能够跑出coherence miss。针对这个问题，有两个方案，第一，重写parsec，用java实现，第二，很简单，用android的JNI，调用C++代码。目前先用第二种方法试试看，效果怎么样。    

>**备注：**因为刚开始使用markdown写博文，有些东西需要在用的时候总结一下，这一篇博文中，我遇到一个问题是如果用`![](http://)`的语句插入图片，图片的大小往往和文章的尺寸格格不入。百度了一下，可以用嵌入html代码的方法，实现图片大小的自定义，代码如下:

```
<img src="http://..../xxx.png" width = "100" height = "200" alt="图片名称" align=center />
```

##parsec3.0 streamcluster android JNI   

完成android sdk和android studio 1.4 IDE 版本的安装后，需要在terminal上输入javah -d jni -classpath时发现总是提示无法访问android.support.v7.app.AppCompatActivity,花了一上午找了很多网页，没有解决问题，郁闷至极，下午去打了个球，回来后，接着google，功夫不负有心人，最终解决了问题，感谢这位网友的博客，这是因为在sdk manager里面的“android support library”没有安装，链接在[这里](http://lxl520.com/me/blog/index.php/archives/19/).
为了避免每次在terminal中输入很多字符，可以选择用环境变量搞定，链接在[这里](http://kanyinqing.com/read/baike/hulianwang/3474865.html),因为是JNI编程，所以还需要安装NDK，我是从百度云盘中搜索找到的android-ndk-r10e,放在了C盘根目录下，再到local.properties文件中设置ndk路径，该文件的完整配置信息如下：

```
sdk.dir=C\:\\Android\\sdk
ndk.dir=C\:\\android-ndk-r10e
```

### Hello Word demo 
在app目录下的 build.gradle中设置库文件名（生成的so文件名）：找到 defaultConfig 这项，在里面添加如下内容:

```
ndk{
       moduleName "callNative"  //设置库(so)文件名称
   }
```

我的MianActivity前几行代码如下：

```
public class MainActivity extends AppCompatActivity {
    public native String callNative();
    static {
        System.loadLibrary("callNative");
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        TextView txtView = (TextView) findViewById(R.id.txt);
        txtView.setText(callNative());

}
```

在设置完ndk后，发现build会出现下面错误：

```
Android-Android studio 出现 Error: NDK integration is deprecated in the current plugin. 问题解决
Error:(50, 0) Error: NDK integration is deprecated in the current plugin. Consider trying the new experimental plugin. For details, see http://tools.android.com/tech-docs/new-build-system/gradle-experimental. Set "android.useDeprecatedNdk=true" in gradle.properties to continue using the current NDK integration.
```

google后找到[答案](http://blog.csdn.net/u014657752/article/details/48106081),在gradle.properties 文件里面添加 android.useDeprecatedNdk=true 后重新编译即可,重新build成功，下面是我安卓手机的截图

<img src="http://heguixiang.github.io/image/JNI_demo.png" width = "300" height = "500" alt="JNI demo" align=center />


### add function demo 
- 下面是我的MainActivity文件的前几行

```
package com.example.seu_hgx.hello_world;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.provider.Settings;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.TextView;
import android.widget .EditText;
import android.view.View.OnClickListener;

public class MainActivity extends AppCompatActivity {
    private static final String tag = "MainActivity";
    private Context mContext = null;
    private Button btnClick = null;
    private String mStrMSG = null;
    private EditText etX = null;
    private EditText etY = null;
    private EditText etResult = null;

    private int x = 0 ;
    private int y = 0 ;

    public native int AddJni(int x ,int y);
    static {
        System.loadLibrary("AddJni");
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        mContext = this;
        //初始化控件
        initViews();

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    /**
     * 初始化控件
     */
    private void initViews() {
        etX = (EditText)findViewById(R.id.et_x);
        etY = (EditText)findViewById(R.id.et_y);
        etResult = (EditText)findViewById(R.id.et_result);
        btnClick = (Button) findViewById(R.id.btn_click);

        btnClick.setOnClickListener(new OnClickListener() {

            public void onClick(View v) {

                if(getX() && getY()){
                    int result = AddJni(x,y);
                    etResult.setText(String.valueOf(result));

                 }else {
                    etX.setText("");
                    etY.setText("");
                    etResult.setText("");
                 }
            }
        });

    }

    /**
     * 获取x
     */
    private boolean getX() {
        String str = etX.getText().toString().trim();
        try {
            x = Integer.valueOf(str);
        } catch(NumberFormatException e) {
            return false;
        }
        return true;
    }

    /**
     * 获取y
     */
    private boolean getY() {
        String str = etY.getText().toString().trim();
        try {
            y = Integer.valueOf(str);
        } catch(NumberFormatException e) {
            return false;
        }
        return true;
    }
}

```
- 下面是我的jni目录情况

![dir](http://heguixiang.github.io/image/JNI_dir.png)

- jni.c代码如下

```
#include "com_example_seu_hgx_hello_world_MainActivity.h"
#include "add.h"

/*
 * Class:     com_example_seu_hgx_hello_world_MainActivity
 * Method:    callNative
 * Signature: ()Ljava/lang/String;
 */
JNIEXPORT jint JNICALL Java_com_example_seu_1hgx_hello_1world_MainActivity_AddJni
        (JNIEnv *env, jobject obj, jint x, jint y){
    return  add(x, y);

}
```
- add.c的文件如下

```
#include "add.h"

/**

 * C 实现的 加法

 */

int add(int x, int y) {

    return x+y;

}
```
- add.h的文件如下

```
#ifndef _ADD_H_
#define _ADD_H_
#include <jni.h>

int add(int x, int y);
#endif
```

- Android.mk的文件如下

```
LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE    := AddJni
LOCAL_SRC_FILES := jni.c
LOCAL_SRC_FILES += add.c

include $(BUILD_SHARED_LIBRARY)
```

- Application.mk的文件如下

```
APP_PROJECT_PATH := ${call my-dir}
APP_MODULES := AddJni

```

- 同时不要忘了将build.gradle defaultConfig里ndk项改成“AddJni”，如下所示

```
    defaultConfig {
        applicationId "com.example.seu_hgx.hello_world"
        minSdkVersion 8
        targetSdkVersion 23
        versionCode 1
        versionName "1.0"
        ndk{
            moduleName "AddJni"
        }
    }
```

- terminal输入的一大串指令在这，记录一下

```
javah -d jni -classpath C:\Android\sdk\platforms\android-23\android.jar;C:\Android\sdk\extras\android\support\v4\android-support-v4.jar;C:\Android\sd
k\extras\android\support\v7\appcompat\libs\android-support-v7-appcompat.jar;..\..\build\intermediates\classes\debug com.example.seu_hgx.hello_world.MainActivity
```

最后，看一下手机app的效果

<img src="http://heguixiang.github.io/image/JNI_add.png" width = "300" height = "500" alt="add" align=center />
