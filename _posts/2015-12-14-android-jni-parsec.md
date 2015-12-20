---
layout: post
title: parsec3.0 android JNI
category: graduation
tags: [ graduation, android ]
---

课题论文涉及到要跑多核多线程的benchmark，最好能体现coherence miss多的benchmark，但是就目前的情况，大部分安卓benchmark并没有充分多核多线程的优势。但是，linux的benchmark parsec3.0，很多测试集都能够跑出coherence miss。针对这个问题，有两个方案，第一，重写parsec，用java实现，第二，很简单，用android的JNI，调用C++代码。目前先用第二种方法试试看，效果怎么样。  

##parsec3.0 streamcluster android JNI   

完成android sdk和android studio 1.4 IDE 版本的安装后，需要在terminal上输入javah -d jni -classpath时发现总是提示无法访问android.support.v7.app.AppCompatActivity,花了一上午找了很多网页，没有解决问题，郁闷至极，下午去打了个球，回来后，接着google，功夫不负有心人，最终解决了问题，感谢这位网友的博客，这是因为在sdk manager里面的“android support library”没有安装，链接在[这里](http://lxl520.com/me/blog/index.php/archives/19/).
为了避免每次在terminal中输入很多字符，可以选择用环境变量搞定，链接在[这里](http://kanyinqing.com/read/baike/hulianwang/3474865.html),因为是JNI编程，所以还需要安装NDK，我是从百度云盘中搜索找到的android-ndk-r10e,放在了C盘根目录下，再到local.properties文件中设置ndk路径，该文件的完整配置信息如下：

```
sdk.dir=C\:\\Android\\sdk
ndk.dir=C\:\\android-ndk-r10e
```

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
![JNI_demo](http://heguixiang.github.io/image/JNI_demo.png)
