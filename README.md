# taro-signature-pad

当前为fork[@yz1311/taro-signature-pad](https://github.com/yz1311/taro-signature-pad)，添加了一些方法

taro的手写签名库

只支持taro3小程序，h5没有做兼容处理，只支持Canvas type="2d"

### 安装
```
npm install @cstu-fork/taro-signature-pad --save
```

### 使用
```
import { SignaturePad } from "@cstu-fork/taro-signature-pad";

...
//组件默认是100%高宽

<Signature
    className="signature-canvas"
    ref={signatureRef}
/>
```


### 方法

#### isEmpty(): boolean

判断是否签名是空白的

#### fromDataURL(dataUrl, options, callback): void 

还原签名数据

* `dataUrl`: 图片的base64数据
* `options`: 选项
* `callback`: 回调方法

#### toDataURL(type, encoderOptions): string

获取签名数据

默认为png图片，实际调用的canvas的toDataURL函数，参考:

https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL

#### clear(): void

清空签名数据

#### save(isSaveImageToPhotosAlbum?: boolean): void

将签名数据转换为png图片并且保存到系统相册


#### rotateSave(angle: number, isSaveImageToPhotosAlbum?: boolean): Promise<string>

旋转签名数据并且保存到系统相册

* `angle`: 旋转角度
* `isSaveImageToPhotosAlbum`: 是否保存到系统相册

返回值为图片存储地址


#### rotateToDataURL(angle: number, type?: string, encoderOptions?: number): string

旋转签名数据并且转换为base64编码

* `angle`: 旋转角度
* `type`: 图片类型
* `encoderOptions`: 图片质量

返回值为图片的base64数据

#### signaturePadRef: React.Ref<SignaturePadOrign>

签名板实例引用

### 截图
![](https://tva1.sinaimg.cn/large/0081Kckwgy1gliuxzjhmsg309s0hsn1i.gif)

