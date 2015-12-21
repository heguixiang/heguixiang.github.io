---
layout: post
title: Android 调用 C 编程生成的可执行程序
description: 安卓调用C生成的可执行程序
keywords: Android Runtime.getRuntime().exec()方法
categories: [graduation, android]
tags : [graduation, android]
---
最近一直在弄Android JNI相关的东西，为的就是能够毕业课题中需要在安卓的环境下调用[parsec3.0](http://parsec.cs.princeton.edu/parsec3-doc.htm)的测试集，比如streamcluster，但是今天看了一下他的MakeFile,执行起来如下所示，因为依赖了很多库，之前想用Android JNI解决这个问题没有想象中那么简单。

```
/usr/bin/g++ -O3 -g -funroll-loops -fprefetch-loop-arrays -fpermissive -fno-exceptions -static-libgcc -Wl,--hash-style=both,--as-needed -DPARSEC_VERSION=3.0-beta-20150206 -DENABLE_THREADS -pthread -c parsec_barrier.cpp
/usr/bin/g++ -O3 -g -funroll-loops -fprefetch-loop-arrays -fpermissive -fno-exceptions -static-libgcc -Wl,--hash-style=both,--as-needed -DPARSEC_VERSION=3.0-beta-20150206 -DENABLE_THREADS -pthread -L/usr/lib64 -L/usr/lib -static streamcluster.o parsec_barrier.o  -o streamcluster
```

streamcluster程序调用的方法为`./streamcluster 10 20 64 8192 8192 1000 none none 32`,参数的解释请看下面：

```
	fprintf(stderr,"  k1:          Min. number of centers allowed\n");
    fprintf(stderr,"  k2:          Max. number of centers allowed\n");
    fprintf(stderr,"  d:           Dimension of each data point\n");
    fprintf(stderr,"  n:           Number of data points\n");
    fprintf(stderr,"  chunksize:   Number of data points to handle per step\n");
    fprintf(stderr,"  clustersize: Maximum number of intermediate centers\n");
    fprintf(stderr,"  infile:      Input file (if n<=0)\n");
    fprintf(stderr,"  outfile:     Output file\n");
    fprintf(stderr,"  nproc:       Number of threads to use\n");
```

google了一把还有什么方法可以调用C写的代码，搜了一下，还真有，看了一下，安卓下有个api叫`Runtime.getRuntime()`貌似符合我的要求,链接在[这里](http://blog.csdn.net/foruok/article/details/23207757)。
>**备注：**滋生一个想法，编译streamcluster的时候加上-static命令，实现静态链接，这样生成的可执行程序就可以不用担心依赖库的问题了（JNI 方法很有可能在这边就会出问题）然后将生成的可执行文件放到/system/bin/下，然后到Android App下调用。不知道行不行，先把想法记录一下吧。

##Runtime.exec() 方法使用
Runtime.exec() 有四种调用方法:
1. public Process exec(String command);
2. public Process exec(String [] cmdArray);
3. public Process exec(String command, String [] envp);
4. public Process exec(String [] cmdArray, String [] envp);

网友是怎么用这个API的：

```
Process process = Runtime.getRuntime().exec("/system/bin/ping");
```

Linux下调用系统命令并弹出终端窗口就要改成下面的格式

```
String [] cmd={"/bin/sh","-c","xterm -e ln -s exe1 exe2"};
Process proc =Runtime.getRuntime().exec(cmd);
```
还有要设置调用程序的工作目录就要

```
Process proc =Runtime.getRuntime().exec("exeflie",null, new File("workpath"));
```

在当前目录执行dir命令，并将结果保存到c:\dir.txt文本文件中：

```
Runtime r = Runtime.getRuntime();
try{
  Process proc = r.exec("cmd /c dir > %dest%", new String[]{"dest=c:\\dir.txt", new File("d:\\test")});
  int exitVal = proc.waitFor(); // 阻塞当前线程，并等待外部程序中止后获取结果码
  System.out.println(exitVal == 0 ? "成功" : "失败");
}
catch(Exception e){
  e.printStackTrace();
}
```

##使用NDK生成native C/C++的可执行程序
这一节摘自网友的[blog](http://blog.csdn.net/nicebooks/article/details/6601005)。
众所周知, NDK可以生成lib,让java程序通过jni来调用,其实,NDK也可以生成C/C++的可执行程序.不过这个程序要被执行的话还有要求.

1. 可执行文件的名字必须是lib*.so. 否则apk安装时不会安装上去,因为目前apk的安装只支持安装lib文件,即lib*.so文件,如果不是此文件格式的,安装时不会拷到lib目录里.也可以考虑把可执行文件放assets里,java程序运行后把它拷贝到其它目录或系统目录.
2. 这个文件的执行必须由java程序通过Runtime.getRuntime().exec()来执行.

下面是我看到的几个Android.mk的相关内容记录一下：

其一：

```
 Android.mk中的内如如下：
 LOCAL_PATH := $(call my-dir)
 include $(CLEAR_VARS)
 LDFALGS += -Bdynamic -Wl,-dynamic-linker,/system/bin/linker
 LOCAL_LDLIBS += -llog
 LOCAL_MODULE    := test
 LOCAL_SRC_FILES := test.cpp
 include $(BUILD_EXECUTABLE)
```

其二：

```
 Android.mk：
 LOCAL_PATH := $(call my-dir)
 include $(CLEAR_VARS)
 LOCAL_SRC_FILES :=  main.c
 LOCAL_MODULE := main.out
 LOCAL_LDLIBS := -L$(LOCAL_PATH)/lib -llibeffecttest -llibeffectperformancetest -llibtestkittest -llibgraph -llibmediaplayer -llibkernel -llibmediaplayer -llibjsext -llibshell -llibdtv -llibdtvmx
 LOCAL_LDLIBS += -lz -llog -ldl 
 include $(BUILD_EXECUTABLE)
```

其三：

```
 CFLAGS="-march=corei7-avx -O2 -pipe -fomit-frame-pointer -fstack-check"
 CXXFLAGS="${CFLAGS} -fno-enforce-eh-specs -fno-optional-diags"
 LDFLAGS="${LDFLAGS} -Wl,--hash-style=gnu -Wl,--as-needed -Wl,-O1"
```

###模块描述变量
下面的变量用于向编译系统描述你的模块。你应该定义在'include  $(CLEAR_VARS)'和'include $(BUILD_XXXXX)'之间。正如前面描写的那样，$(CLEAR_VARS)是一个脚本，清除所有这些变量。
- LOCAL_PATH:  这个变量用于给出当前文件的路径。必须在 Android.mk 的开头定义，可以这样使用：LOCAL_PATH := $(call my-dir)  这个变量不会被$(CLEAR_VARS)清除，因此每个 Android.mk 只需要定义一次(即使在一个文件中定义了几个模块的情况下)。
- LOCAL_MODULE: 这是模块的名字，它必须是唯一的，而且不能包含空格。必须在包含任一的$(BUILD_XXXX)脚本之前定义它。模块的名字决定了生成文件的名字。例如，如果一个一个共享库模块的名字是，那么生成文件的名字就是 lib.so。但是，在的 NDK 生成文
件中(或者 Android.mk 或者 Application.mk)，应该只涉及(引用)有正常名字的其他模块。
- LOCAL_SRC_FILES:  这是要编译的源代码文件列表。只要列出要传递给编译器的文件，因为编译系统自动计算依赖。注意源代码文件名称都是相对于 LOCAL_PATH的，你可以使用路径部分，例如：

```
LOCAL_SRC_FILES := foo.c toto/bar.c\
Hello.c
```

文件之间可以用空格或Tab键进行分割,换行请用"\".如果是追加源代码文件的话，请用LOCAL_SRC_FILES +=
**注意**：在生成文件中都要使用UNIX风格的斜杠(/).windows风格的反斜杠不会被正确的处理。
**注意**：可以LOCAL_SRC_FILES := $(call all-subdir-java-files)这种形式来包含local_path目录下的所有java文件。

- LOCAL_CPP_EXTENSION:  这是一个可选变量， 用来指定C++代码文件的扩展名，默认是'.cpp',但是可以改变它，比如：
  LOCAL_CPP_EXTENSION := .cxx

- LOCAL_C_INCLUDES:  可选变量，表示头文件的搜索路径。默认的头文件的搜索路径是LOCAL_PATH目录。
示例:LOCAL_C_INCLUDES := sources/foo或LOCAL_C_INCLUDES := $(LOCAL_PATH)/../foo
     LOCAL_C_INCLUDES需要在任何包含LOCAL_CFLAGS/LOCAL_CPPFLAGS标志之前进行设置。

- LOCAL_CFLAGS:  可选的编译器选项，在编译 C 代码文件的时候使用。这可能是有用的，指定一个附加的包含路径(相对于NDK的顶层目录)，宏定义，或者编译选项。

注意：不要在 Android.mk 中改变 optimization/debugging 级别，只要在 Application.mk中指定合适的信息，就会自动地为你处理这个问题，在调试期间，会让NDK自动生成有用的数据文件。

- LOCAL_CXXFLAGS:  与 LOCAL_CFLAGS同理，针对 C++源文件。
- LOCAL_CPPFLAGS:  与 LOCAL_CFLAGS同理，但是对 C 和 C++ source files都适用。
- LOCAL_STATIC_LIBRARIES: 表示该模块需要使用哪些静态库，以便在编译时进行链接。
- LOCAL_SHARED_LIBRARIES:表示模块在运行时要依赖的共享库（动态库），在链接时就需要，以便在生成文件时嵌入其相应的信息。注意：它不会附加列出的模块到编译图，也就是仍然需要在Application.mk 中把它们添加到程序要求的模块中。

- LOCAL_LDLIBS:  编译模块时要使用的附加的链接器选项。这对于使用‘-l’前缀传递指定库的名字是有用的。
例如，LOCAL_LDLIBS := -lz表示告诉链接器生成的模块要在加载时刻链接到/system/lib/libz.so。可查看 docs/STABLE-APIS.TXT 获取使用 NDK发行版能链接到的开放的系统库列表。

- LOCAL_ALLOW_UNDEFINED_SYMBOLS:默认情况下，在试图编译一个共享库时，任何未定义的引用将导致一个“未定义的符号”错误。这对于在源代码文件中捕捉错误会有很大的帮助。然而，如果因为某些原因，需要不启动这项检查，可把这个变量设为‘true’。注意相应的共享库可能在运行时加载失败。(这个一般尽量不要去设为 true)。

- LOCAL_ARM_MODE: 默认情况下， arm目标二进制会以 thumb 的形式生成(16 位)，你可以通过设置这个变量为 arm如果你希望你的 module 是以 32 位指令的形式。
'arm' (32-bit instructions) mode. E.g.: LOCAL_ARM_MODE := arm
注意：可以在编译的时候告诉系统针对某个源码文件进行特定的类型的编译.比如，LOCAL_SRC_FILES := foo.c bar.c.arm  这样就告诉系统总是将 bar.c 以arm的模式编译。

- LOCAL_MODULE_PATH 和 LOCAL_UNSTRIPPED_PATH
在 Android.mk 文件中， 还可以用LOCAL_MODULE_PATH 和LOCAL_UNSTRIPPED_PATH指定最后的目标安装路径.不同的文件系统路径用以下的宏进行选择：

```
TARGET_ROOT_OUT：表示根文件系统。
TARGET_OUT：表示 system文件系统。
TARGET_OUT_DATA：表示 data文件系统。
```

用法如：LOCAL_MODULE_PATH :=$(TARGET_ROOT_OUT) 
至于LOCAL_MODULE_PATH 和LOCAL_UNSTRIPPED_PATH的区别，暂时还不清楚。

##streamcluster MakeFile各个参数含义
首先还是抄下上面提到的这个streamcluster的编译配置情况

```
/usr/bin/g++ -O3 -g -funroll-loops -fprefetch-loop-arrays -fpermissive -fno-exceptions -static-libgcc -Wl,--hash-style=both,--as-needed -DPARSEC_VERSION=3.0-beta-20150206 -DENABLE_THREADS -pthread -L/usr/lib64 -L/usr/lib -static streamcluster.o parsec_barrier.o  -o streamcluster
```

下面一个一个来分析：

- funroll-loops：使用编译器的 -funroll-loops 选项 完全展开循环结构。原理： -funroll-loops编译选项使得程序中的循环步骤完全展开，这样会增加汇编代码的长度。

- fprefetch-loop-arrays：生成数组预读取指令，对于使用巨大数组的程序可以加快代码执行速度，适合数据库相关的大型软件等。具体效果如何取决于代码。

- fpermissive：在VS2010下编译通过的程序，移植到ARM平台时，通过ARM-GCC交叉编译时出现-fpermissive问题，问题描述是taking address of temporary [-fpermissive]查了一些资料，可能是不同编译器或者新旧编译器对于c++标准的不同解释的结果，在GCC下对于模板继承的规定与VS不同，有一个简单粗暴的解决办法，就是在交叉编译指令里面加入-fpermissive这一条命令，让模板代码由出错降为警告，从而编译通过。

- fno-exceptions：禁用异常机制，一般只有对程序运行效率及资源占用比较看重的场合才会使用。
- static-libgcc：静态链接 gcc 库，这里和半静态链接方式编译，这里和`-L/usr/lib64`以及`-L/usr/lib`一起说吧，这两个参数`-Ldir`指定库搜索路径。下面先介绍下三种标准库链接方式的选项和区别吧,更详细的说明在[这里](https://www.ibm.com/developerworks/cn/linux/l-cn-linklib/)。

|标准库连接方式|     示例连接选项           |                         优点                          |                            缺点                              |
|--------------|----------------------------|-------------------------------------------------------|--------------------------------------------------------------|
|    全静态    | -static -pthread -lrt -ldl | 不会发生应用程序在 不同 Linux 版本下的标准库不兼容问题|     生成的文件比较大，应用程序功能受限,不能调用动态库        |
|    全动态    |   -pthread -lrt -ldl       |   生成文件是三者中最小的                              | 比较容易发生应用程序在不同Linux 版本下标准库依赖不兼容问题   |
|    半静态    |-static-libgcc -L. -pthread -lrt -ldl|能够针对不同的标准库采取不同的链接策略，从而避免不兼容问题发生 |    比较难识别哪些库容易发生不兼容问题       |
>备注：想用Android JNI还是用全静态靠谱

- Wl,--hash-style=both,--as-needed : Wl,option把选项option传递给连接器。如果option中含有逗号, 就在逗号处分割成多个选项。这个关系不大好像，默认加上。

- DPARSEC_VERSION=3.0-beta-20150206 -DENABLE_THREADS：这两选项跟streamcluster.cpp里自定义的编译编译选项有关系，请看代码，下面是跟PARSEC_VERTION相关：

```
#ifdef PARSEC_VERSION
#define __PARSEC_STRING(x) #x
#define __PARSEC_XSTRING(x) __PARSEC_STRING(x)
        fprintf(stderr,"PARSEC Benchmark Suite Version "__PARSEC_XSTRING(PARSEC_VERSION)"\n");
	fflush(NULL);
#else
        fprintf(stderr,"PARSEC Benchmark Suite\n");
	fflush(NULL);
#endif //PARSEC_VERSION
#ifdef ENABLE_PARSEC_HOOKS
  __parsec_bench_begin(__parsec_streamcluster);
#endif
```

再看跟ENABLE_THREADS相关的编译选项：

```
#ifdef ENABLE_THREADS
#include <pthread.h>
#include "parsec_barrier.hpp"
#endif
```

>备注：两个选项应该也要加进去的

顺便看一下`./streamcluster/inst/amd64-linux.gcc/build-info`文件的CFLAGS

```
CFLAGS:  -O3 -g -funroll-loops -fprefetch-loop-arrays -static-libgcc -Wl,--hash-style=both,--as-needed -DPARSEC_VERSION=3.0-beta-20150206
LDFLAGS: -L/usr/lib64 -L/usr/lib -static
```
- pthread: -pthread或者-pthreads的编译选项是用于在编译时增加多线程的支持

