import React, { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import Taro from '@tarojs/taro';
import { Canvas } from "@tarojs/components";
import { SignaturePadInstance, FromDataURLOptions } from './utils/signature_pad'
import { useId } from './hooks/useId';
export * from './utils/signature_pad'
export { default as Bezier } from "./utils/bezier"
export { default as Point } from "./utils/point"
export { default as throttle } from "./utils/throttle"
export * from "./utils/util"
export * from "./hooks/useId"
import './styles.css';

export interface IProps {
  className?: string;
  style?: string;
}

export interface IRef {
  /*** 保存签名 */
  save: (isSaveImageToPhotosAlbum?: boolean) => Promise<string>;
  /*** 清除签名 */
  clear: () => void;
  /*** 转换为base64编码 */
  toDataURL: (type?: string, encoderOptions?: number) => string;
  /*** 检查是否为空 */
  isEmpty: () => boolean;
  /*** 从base64编码加载签名 */
  fromDataURL: (dataUrl: string, options?: FromDataURLOptions, callback?: (error?: string | Event) => void) => void;
  /*** 旋转签名 */
  rotateToDataURL: (angle: number, type?: string, encoderOptions?: number) => string;
  /*** 处理旋转保存签名 */
  rotateSave: (angle: number, isSaveImageToPhotosAlbum?: boolean) => Promise<string>;
  /*** 签名板实例引用 */
  signaturePadRef: React.Ref<SignaturePadInstance>;
}

const SignaturePadBase = React.forwardRef<IRef, IProps>(({ className, style }, ref) => {
  const id = useId('cstu-canvas-sign-pad');

  const canvasRef = useRef<HTMLCanvasElement>();
  const signaturePadRef = useRef<SignaturePadInstance>(new SignaturePadInstance());

  const handleTouchStart = useCallback((e) => {
    signaturePadRef.current && signaturePadRef.current.handleTouchStart(e);
  }, []);

  const handleTouchMove = useCallback((e) => {
    signaturePadRef.current && signaturePadRef.current.handleTouchMove(e);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    signaturePadRef.current && signaturePadRef.current.handleTouchEnd(e);
  }, []);

  const handleSaveCanvas = useCallback((isSaveImageToPhotosAlbum: boolean = true): Promise<string> => {
    if (!canvasRef.current) {
      return;
    }
    return new Promise((resolve, reject) => {
      //@ts-ignore
      Taro.canvasToTempFilePath({
        canvas: canvasRef.current as unknown as Taro.Canvas,
        success(res) {
          const tempFilePath = res.tempFilePath;
          if (isSaveImageToPhotosAlbum) {
            Taro.saveImageToPhotosAlbum({
              filePath: `${tempFilePath}`,
              success() {
                Taro.showToast({ title: '保存成功' });
                resolve(tempFilePath);
              },
              fail(err) {
                Taro.showToast({ title: '保存失败' });
                reject(err);
              }
            })
          } else {
            resolve(tempFilePath);
          }
        },
        fail(err) {
          Taro.showToast({ title: '保存失败' });
          reject(err);
        }
      })
    })
  }, []);

  const handleRotateSaveCanvas = useCallback((angle: number, isSaveImageToPhotosAlbum: boolean = true): Promise<string> => {
    if (!canvasRef.current) {
      return;
    }
    return new Promise((resolve, reject) => {
      const canvas = signaturePadRef.current._rotateCanvas(angle);
      //@ts-ignore
      Taro.canvasToTempFilePath({
        canvas: canvas as unknown as Taro.Canvas,
        success(res) {
          const tempFilePath = res.tempFilePath;
          if (isSaveImageToPhotosAlbum) {
            Taro.saveImageToPhotosAlbum({
              filePath: `${tempFilePath}`,
              success() {
                Taro.showToast({ title: '保存成功' });
                resolve(tempFilePath);
              },
              fail(err) {
                Taro.showToast({ title: '保存失败' });
                reject(err);
              }
            })
          } else {
            resolve(tempFilePath);
          }
        },
        fail(err) {
          Taro.showToast({ title: '保存失败' });
          reject(err);
        }
      })
    })
  }, []);

  const handleClearCanvas = useCallback(() => {
    signaturePadRef.current.clear();
  }, []);

  const toDataURL = useCallback((type?: string, encoderOptions?: number) => {
    return signaturePadRef.current.toDataURL(type, encoderOptions);
  }, []);

  const rotateToDataURL = useCallback((angle: number, type?: string, encoderOptions?: number) => {
    return signaturePadRef.current.rotateToDataURL(angle, type, encoderOptions);
  }, []);

  const isEmpty = useCallback(() => {
    return signaturePadRef.current.isEmpty();
  }, []);

  const fromDataURL = useCallback((dataUrl: string, options?: FromDataURLOptions, callback?: (error?: string | Event) => void) => {
    signaturePadRef.current.fromDataURL(dataUrl, options, callback);
  }, []);

  useImperativeHandle(ref, () => ({
    save: handleSaveCanvas,
    clear: handleClearCanvas,
    toDataURL: toDataURL,
    isEmpty: isEmpty,
    fromDataURL: fromDataURL,
    rotateToDataURL: rotateToDataURL,
    rotateSave: handleRotateSaveCanvas,
    signaturePadRef: signaturePadRef
  }));

  useEffect(() => {
    Taro.nextTick(() => {
      //需要设置为type=2d才会不报错
      const query = Taro.createSelectorQuery().in(Taro.getCurrentInstance().page);
      query.select(`.${id}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node as HTMLCanvasElement
          const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
          const dpr = Taro.getSystemInfoSync().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          signaturePadRef.current.init(canvas);
          canvasRef.current = canvas;
        })
    });
  }, [id]);

  return (
    <Canvas
      className={`cstu-fork-canvas-sign-pad ${id} ${className}`}
      style={style}
      id={id}
      canvasId={id}
      type="2d"
      disableScroll={true}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
});

export const SignaturePad = React.memo(SignaturePadBase);
