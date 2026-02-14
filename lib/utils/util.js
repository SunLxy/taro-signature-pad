var __webpack_modules__ = {
    "./src/utils/util.ts": function(module) {
        const formatTime = (date)=>{
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            return [
                year,
                month,
                day
            ].map(formatNumber).join('/') + ' ' + [
                hour,
                minute,
                second
            ].map(formatNumber).join(':');
        };
        const formatNumber = (n)=>{
            const _n = n.toString();
            return _n[1] ? _n : '0' + _n;
        };
        module.exports = {
            formatTime: formatTime
        };
    }
};
var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
}
var __webpack_exports__ = __webpack_require__("./src/utils/util.ts");
for(var __webpack_i__ in __webpack_exports__)exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
Object.defineProperty(exports, '__esModule', {
    value: true
});
