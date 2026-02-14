"use strict";
var __webpack_require__ = {};
(()=>{
    __webpack_require__.n = (module)=>{
        var getter = module && module.__esModule ? ()=>module['default'] : ()=>module;
        __webpack_require__.d(getter, {
            a: getter
        });
        return getter;
    };
})();
(()=>{
    __webpack_require__.d = (exports1, definition)=>{
        for(var key in definition)if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports1, key)) Object.defineProperty(exports1, key, {
            enumerable: true,
            get: definition[key]
        });
    };
})();
(()=>{
    __webpack_require__.o = (obj, prop)=>Object.prototype.hasOwnProperty.call(obj, prop);
})();
(()=>{
    __webpack_require__.r = (exports1)=>{
        if ('undefined' != typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports1, Symbol.toStringTag, {
            value: 'Module'
        });
        Object.defineProperty(exports1, '__esModule', {
            value: true
        });
    };
})();
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
    default: ()=>SignaturePad
});
const taro_namespaceObject = require("@tarojs/taro");
var taro_default = /*#__PURE__*/ __webpack_require__.n(taro_namespaceObject);
const external_bezier_js_namespaceObject = require("./bezier.js");
var external_bezier_js_default = /*#__PURE__*/ __webpack_require__.n(external_bezier_js_namespaceObject);
const external_point_js_namespaceObject = require("./point.js");
var external_point_js_default = /*#__PURE__*/ __webpack_require__.n(external_point_js_namespaceObject);
const external_throttle_js_namespaceObject = require("./throttle.js");
var external_throttle_js_default = /*#__PURE__*/ __webpack_require__.n(external_throttle_js_namespaceObject);
class SignaturePad {
    options;
    velocityFilterWeight;
    minWidth;
    maxWidth;
    throttle;
    minDistance;
    dotSize;
    penColor;
    backgroundColor;
    onBegin;
    onEnd;
    canvas;
    _ctx;
    _data;
    _isEmpty;
    _strokeMoveUpdate;
    _lastWidth;
    _lastPoints;
    _lastVelocity;
    constructor(options = {}){
        this.options = options;
        this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
        this.minWidth = options.minWidth || 0.5;
        this.maxWidth = options.maxWidth || 2.5;
        this.throttle = 'throttle' in options ? options.throttle : 16;
        this.minDistance = 'minDistance' in options ? options.minDistance : 5;
        if (this.throttle) this._strokeMoveUpdate = external_throttle_js_default()(SignaturePad.prototype._strokeUpdate, this.throttle);
        else this._strokeMoveUpdate = SignaturePad.prototype._strokeUpdate;
        this.dotSize = options.dotSize || function() {
            return (this.minWidth + this.maxWidth) / 2;
        };
        this.penColor = options.penColor || 'black';
        this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
        this.onBegin = options.onBegin;
        this.onEnd = options.onEnd;
    }
    init = (canvas)=>{
        this.canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this.clear();
    };
    clear = ()=>{
        const ctx = this._ctx;
        const canvas = this.canvas;
        ctx.fillStyle = this.backgroundColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this._data = [];
        this._reset();
        this._isEmpty = true;
    };
    handleTouchStart = (event)=>{
        if (1 === event.touches.length) {
            const touch = event.changedTouches[0];
            this._strokeBegin(touch);
        }
    };
    handleTouchMove = (event)=>{
        const touch = event.touches[0];
        this._strokeMoveUpdate(touch);
    };
    handleTouchEnd = (event)=>{
        const wasCanvasTouched = event.target === this.canvas;
        if (wasCanvasTouched) {
            const touch = event.changedTouches[0];
            this._strokeEnd(touch);
        }
    };
    fromDataURL = (dataUrl, options = {}, callback)=>{
        const image = new Image();
        const ratio = options.ratio || 1;
        const width = options.width || this.canvas.width / ratio;
        const height = options.height || this.canvas.height / ratio;
        this._reset();
        image.onload = ()=>{
            this._ctx.drawImage(image, 0, 0, width, height);
            if (callback) callback();
        };
        image.onerror = (error)=>{
            if (callback) callback(error);
        };
        image.src = dataUrl;
        this._isEmpty = false;
    };
    _rotateCanvas = (angle)=>{
        const o_canvas = this.canvas;
        const canvasWidth = o_canvas.width;
        const canvasHeight = o_canvas.height;
        const canvas = taro_default().createOffscreenCanvas({
            width: canvasHeight,
            height: canvasWidth,
            type: '2d'
        });
        const context = canvas.getContext('2d');
        context.translate(0, canvasWidth);
        context.rotate(angle);
        context.drawImage(o_canvas, 0, 0, canvasWidth, canvasHeight);
        return canvas;
    };
    rotateToDataURL = (angle, type = 'image/png', encoderOptions)=>{
        const canvas = this._rotateCanvas(angle);
        const base64 = canvas.toDataURL(type, encoderOptions);
        return base64;
    };
    toDataURL = (type = 'image/png', encoderOptions)=>{
        switch(type){
            default:
                return this.canvas.toDataURL(type, encoderOptions);
        }
    };
    isEmpty = ()=>this._isEmpty;
    fromData(pointGroups) {
        this.clear();
        this._fromData(pointGroups, ({ color, curve })=>this._drawCurve({
                color,
                curve
            }), ({ color, point })=>this._drawDot({
                color,
                point
            }));
        this._data = pointGroups;
    }
    toData() {
        return this._data;
    }
    _strokeBegin(event) {
        const newPointGroup = {
            color: this.penColor,
            points: []
        };
        this._data.push(newPointGroup);
        this._reset();
        this._strokeUpdate(event);
        if ('function' == typeof this.onBegin) this.onBegin(event);
    }
    _strokeUpdate(event) {
        const x = event.x;
        const y = event.y;
        const point = this._createPoint(x, y);
        const lastPointGroup = this._data[this._data.length - 1];
        const lastPoints = lastPointGroup.points;
        const lastPoint = lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
        const isLastPointTooClose = lastPoint ? point.distanceTo(lastPoint) <= this.minDistance : false;
        const color = lastPointGroup.color;
        if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
            const curve = this._addPoint(point);
            if (lastPoint) {
                if (curve) this._drawCurve({
                    color,
                    curve
                });
            } else this._drawDot({
                color,
                point
            });
            lastPoints.push({
                time: point.time,
                x: point.x,
                y: point.y
            });
        }
    }
    _strokeEnd(event) {
        this._strokeUpdate(event);
        if ('function' == typeof this.onEnd) this.onEnd(event);
    }
    _reset() {
        this._lastPoints = [];
        this._lastVelocity = 0;
        this._lastWidth = (this.minWidth + this.maxWidth) / 2;
        this._ctx.fillStyle = this.penColor;
    }
    _createPoint(x, y) {
        const rect = {
            left: 0,
            top: 0
        };
        return new (external_point_js_default())(x - rect.left, y - rect.top, new Date().getTime());
    }
    _addPoint(point) {
        const { _lastPoints } = this;
        _lastPoints.push(point);
        if (_lastPoints.length > 2) {
            if (3 === _lastPoints.length) _lastPoints.unshift(_lastPoints[0]);
            const widths = this._calculateCurveWidths(_lastPoints[1], _lastPoints[2]);
            const curve = external_bezier_js_default().fromPoints(_lastPoints, widths);
            _lastPoints.shift();
            return curve;
        }
        return null;
    }
    _calculateCurveWidths(startPoint, endPoint) {
        const velocity = this.velocityFilterWeight * endPoint.velocityFrom(startPoint) + (1 - this.velocityFilterWeight) * this._lastVelocity;
        const newWidth = this._strokeWidth(velocity);
        const widths = {
            end: newWidth,
            start: this._lastWidth
        };
        this._lastVelocity = velocity;
        this._lastWidth = newWidth;
        return widths;
    }
    _strokeWidth(velocity) {
        return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
    }
    _drawCurveSegment(x, y, width) {
        const ctx = this._ctx;
        ctx.moveTo(x, y);
        ctx.arc(x, y, width, 0, 2 * Math.PI, false);
        this._isEmpty = false;
    }
    _drawCurve({ color, curve }) {
        const ctx = this._ctx;
        const widthDelta = curve.endWidth - curve.startWidth;
        const drawSteps = 2 * Math.floor(curve.length());
        ctx.beginPath();
        ctx.fillStyle = color;
        for(let i = 0; i < drawSteps; i += 1){
            const t = i / drawSteps;
            const tt = t * t;
            const ttt = tt * t;
            const u = 1 - t;
            const uu = u * u;
            const uuu = uu * u;
            let x = uuu * curve.startPoint.x;
            x += 3 * uu * t * curve.control1.x;
            x += 3 * u * tt * curve.control2.x;
            x += ttt * curve.endPoint.x;
            let y = uuu * curve.startPoint.y;
            y += 3 * uu * t * curve.control1.y;
            y += 3 * u * tt * curve.control2.y;
            y += ttt * curve.endPoint.y;
            const width = curve.startWidth + ttt * widthDelta;
            this._drawCurveSegment(x, y, width);
        }
        ctx.closePath();
        ctx.fill();
    }
    _drawDot({ color, point }) {
        const ctx = this._ctx;
        const width = 'function' == typeof this.dotSize ? this.dotSize() : this.dotSize;
        ctx.beginPath();
        this._drawCurveSegment(point.x, point.y, width);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
    _fromData(pointGroups, drawCurve, drawDot) {
        for (const group of pointGroups){
            const { color, points } = group;
            if (points.length > 1) for(let j = 0; j < points.length; j += 1){
                const basicPoint = points[j];
                const point = new (external_point_js_default())(basicPoint.x, basicPoint.y, basicPoint.time);
                this.penColor = color;
                if (0 === j) this._reset();
                const curve = this._addPoint(point);
                if (curve) drawCurve({
                    color,
                    curve
                });
            }
            else {
                this._reset();
                drawDot({
                    color,
                    point: points[0]
                });
            }
        }
    }
}
exports["default"] = __webpack_exports__["default"];
for(var __webpack_i__ in __webpack_exports__)if (-1 === [
    "default"
].indexOf(__webpack_i__)) exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
Object.defineProperty(exports, '__esModule', {
    value: true
});
