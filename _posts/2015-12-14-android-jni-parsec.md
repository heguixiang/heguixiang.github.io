---
layout: post
title: parsec3.0 android JNI
category: graduation
tags: [ graduation, android ]
---
课题论文涉及到要跑多核多线程的benchmark，最好能体现coherence miss多的benchmark，但是就目前的情况，大部分安卓benchmark并没有充分多核多线程的优势。但是，linux的benchmark parsec3.0，很多测试集都能够跑出coherence miss。针对这个问题，有两个方案，第一，重写parsec，用java实现，第二，很简单，用android的JNI，调用C++代码。目前先用第二种方法试试看，效果怎么样。

测试[test4](./just-a-test.md#test4)
[test4](#test)

###parsec3.0 streamcluster android JNI


