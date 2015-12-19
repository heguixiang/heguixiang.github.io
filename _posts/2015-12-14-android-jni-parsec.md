---
layout: post
title: parsec3.0 android JNI
category: graduation
tags: [ graduation, android ]
---
课题论文涉及到要跑多核多线程的benchmark，最好能体现coherence miss多的benchmark，但是就目前的情况，大部分安卓benchmark并没有充分多核多线程的优势。但是，linux的benchmark parsec3.0，很多测试集都能够跑出coherence miss。针对这个问题，有两个方案，第一，重写parsec，用java实现，第二，很简单，用android的JNI，调用C++代码。目前先用第二种方法试试看，效果怎么样。


###parsec3.0 streamcluster android JNI
完成android sdk和android studio 1.4 IDE 版本的安装后，需要在terminal上输入javah -d jni -classpath时发现总是提示无法访问android.support.v7.app.AppCompatActivity,花了一上午找了很多网页，没有解决问题，郁闷至极，下午去打了个球，回来后，接着google，功夫不负有心人，最终解决了问题，感谢这位网友的博客，这是因为在sdk manager里面的“android support library”没有安装，链接在[这里](http://lxl520.com/me/blog/index.php/archives/19/).
为了避免每次在terminal中输入很多字符，可以选择用环境变量搞定，链接在[这里](http://kanyinqing.com/read/baike/hulianwang/3474865.html)

