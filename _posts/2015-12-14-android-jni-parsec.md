---
layout: post
title: Android JNI Parsec3.0
description: 安卓JNI调用parsec3.0的benchmark
keywords: Android JNI parsec3.0
categories: [graduation]
tags: graduation
---
一步一步来，慢慢来研究下JNI。 

##parsec3.0  

完成android sdk和android studio 1.4 IDE 版本的安装后，需要在terminal上输入javah -d jni -classpath时发现总是提示无法访问android.support.v7.app.AppCompatActivity,花了一上午找了很多网页，没有解决问题，郁闷至极，下午去打了个球，回来后，接着google，功夫不负有心人，最终解决了问题，感谢这位网友的博客，这是因为在sdk manager里面的“android support library”没有安装，链接在[这里](http://lxl520.com/me/blog/index.php/archives/19/).
为了避免每次在terminal中输入很多字符，可以选择用环境变量搞定，链接在[这里](http://kanyinqing.com/read/baike/hulianwang/3474865.html),因为是JNI编程，所以还需要安装NDK，我是从百度云盘中搜索找到的android-ndk-r10e,放在了C盘根目录下，再到local.properties文件中设置ndk路径，该文件的完整配置信息如下：


### Hello 
在app目录下的 build.gradle中设置库文件名（生成的so文件名）：找到 defaultConfig 这项，在里面添加如下内容:


我的MianActivity前几行代码如下：


在设置完ndk后，发现build会出现下面错误：


google后找到[答案](http://blog.csdn.net/u014657752/article/details/48106081),在gradle.properties 文件里面添加 android.useDeprecatedNdk=true 后重新编译即可,重新build成功，下面是我安卓手机的截图
