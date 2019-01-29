"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Constants_1 = require("./Constants");
exports.styles = react_native_1.StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden'
    },
    fill: {
        flex: 1
    },
    topShadow: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: Constants_1.SEPARATOR_HEIGHT
    },
    bottomShadow: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: Constants_1.SEPARATOR_HEIGHT
    }
});
//# sourceMappingURL=Styles.js.map