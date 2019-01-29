"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Behaviours_1 = require("./Behaviours");
var React = __importStar(require("react"));
var Constants_1 = require("./resources/Constants");
var Styles_1 = require("./resources/Styles");
var CLAppBar = /** @class */ (function (_super) {
    __extends(CLAppBar, _super);
    function CLAppBar(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.getDimensionRange = function () {
            return { minHeight: _this.state.minHeight, maxHeight: _this.state.maxHeight };
        };
        _this.getBehaviours = function () {
            return _this.props.scrollBehaviours;
        };
        _this.containerStyle = function () {
            return { bottom: Constants_1.SEPARATOR_HEIGHT };
        };
        _this.shadowImageSource = function () {
            return require('./resources/assets/' + Constants_1.TOP_SHADOW_IMAGE);
        };
        _this.separatorStyle = function () {
            return Styles_1.styles.bottomShadow;
        };
        _this.renderItems = function (scrollBehaviourOffset) {
            var children = [];
            var index = 0;
            var topPosition = (_this.props.safeAreaInsets && _this.props.safeAreaInsets.top) || 0;
            var translateYOffset = new react_native_1.Animated.Value(0);
            for (var _i = 0, _a = _this.props.scrollBehaviours; _i < _a.length; _i++) {
                var scrollBehaviour = _a[_i];
                var content = _this.props.contentRenderer(index, scrollBehaviourOffset);
                var itemMinHeight = _this.props.scrollBehaviours[index].minHeight ? _this.props.scrollBehaviours[index].minHeight : 0;
                var itemMaxHeight = _this.props.scrollBehaviours[index].maxHeight;
                var alpha = scrollBehaviour.scrollEffect & Behaviours_1.CLScrollEffect.FADE
                    ? scrollBehaviourOffset.interpolate({
                        inputRange: [0, 0.5, 0.75],
                        outputRange: [1, 0.25, 0],
                        extrapolate: 'clamp'
                    })
                    : new react_native_1.Animated.Value(1);
                var itemTranslateY = scrollBehaviour.scrollEffect & Behaviours_1.CLScrollEffect.SCROLL
                    ? scrollBehaviourOffset.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, itemMinHeight - itemMaxHeight],
                        extrapolate: 'clamp'
                    })
                    : new react_native_1.Animated.Value(0);
                var height = scrollBehaviour.scrollEffect & Behaviours_1.CLScrollEffect.COLLAPSE
                    ? scrollBehaviourOffset.interpolate({
                        inputRange: [0, 1],
                        outputRange: [itemMaxHeight, itemMinHeight],
                        extrapolate: 'clamp'
                    })
                    : new react_native_1.Animated.Value(itemMaxHeight);
                var yOffsetFromHeight = scrollBehaviour.scrollEffect & Behaviours_1.CLScrollEffect.COLLAPSE
                    ? height.interpolate({
                        inputRange: [itemMinHeight, itemMaxHeight],
                        outputRange: [itemMinHeight - itemMaxHeight, 0],
                        extrapolate: 'clamp'
                    })
                    : new react_native_1.Animated.Value(0);
                var translateY = react_native_1.Animated.add(translateYOffset, itemTranslateY);
                translateYOffset = react_native_1.Animated.add(translateY, yOffsetFromHeight);
                var item = (<react_native_1.Animated.View key={index} style={{
                    position: 'absolute',
                    top: topPosition,
                    left: 0,
                    right: 0,
                    transform: [{ translateY: translateY }],
                    opacity: alpha,
                    height: height,
                    zIndex: -index,
                    overflow: 'hidden'
                }}>
                    {content}
                </react_native_1.Animated.View>);
                children.push(item);
                topPosition += itemMaxHeight;
                index++;
            }
            return children;
        };
        _this.state = CLAppBar.getDerivedState(props, undefined);
        return _this;
    }
    CLAppBar.getDerivedState = function (nextProps, _) {
        var minHeight = (nextProps.safeAreaInsets ? (nextProps.safeAreaInsets.top || 0) + (nextProps.safeAreaInsets.bottom || 0) : 0) + (nextProps.showSeparator ? Constants_1.SEPARATOR_HEIGHT : 0);
        var maxHeight = minHeight;
        for (var _i = 0, _a = nextProps.scrollBehaviours; _i < _a.length; _i++) {
            var behaviour = _a[_i];
            var deducedDimensionBehaviour = { minHeight: 0, maxHeight: behaviour.maxHeight };
            if (behaviour.scrollEffect & Behaviours_1.CLScrollEffect.COLLAPSE) {
                deducedDimensionBehaviour.minHeight = behaviour.minHeight;
            }
            else if ((behaviour.scrollEffect & Behaviours_1.CLScrollEffect.SCROLL) === Behaviours_1.CLScrollEffect.NONE) {
                deducedDimensionBehaviour.minHeight = behaviour.maxHeight;
            }
            minHeight += deducedDimensionBehaviour.minHeight;
            maxHeight += deducedDimensionBehaviour.maxHeight;
        }
        var heightAnimatedValue = nextProps.scrollBehaviourOffset.interpolate({
            inputRange: [0, 1],
            outputRange: [maxHeight, minHeight],
            extrapolate: 'clamp'
        });
        return { minHeight: minHeight, maxHeight: maxHeight, heightAnimatedValue: heightAnimatedValue };
    };
    CLAppBar.prototype.shouldComponentUpdate = function (nextProps, _nextState, _nextContext) {
        return nextProps !== this.props;
    };
    CLAppBar.prototype.componentWillReceiveProps = function (nextProps, _nextContext) {
        this.setState(CLAppBar.getDerivedState(nextProps, this.state));
    };
    CLAppBar.prototype.render = function () {
        if (this.props.showSeparator) {
            var shadowImageSource = this.shadowImageSource();
            var containerStyle = this.containerStyle();
            var separatorStyle = this.separatorStyle();
            return (<react_native_1.Animated.View {...this.props} style={[this.props.style, { height: this.state.heightAnimatedValue, backgroundColor: Constants_1.CLEAR_COLOR }]}>
                    <react_native_1.View style={[this.props.style, containerStyle]}>{this.renderItems(this.props.scrollBehaviourOffset)}</react_native_1.View>
                    <react_native_1.Image style={separatorStyle} source={shadowImageSource} resizeMode={'stretch'}/>
                </react_native_1.Animated.View>);
        }
        else {
            return (<react_native_1.Animated.View {...this.props} style={[this.props.style, { height: this.state.heightAnimatedValue }]}>
                    {this.renderItems(this.props.scrollBehaviourOffset)}
                </react_native_1.Animated.View>);
        }
    };
    return CLAppBar;
}(React.Component));
exports.CLAppBar = CLAppBar;
var CLBottomBar = /** @class */ (function (_super) {
    __extends(CLBottomBar, _super);
    function CLBottomBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.containerStyle = function () {
            return { top: Constants_1.SEPARATOR_HEIGHT };
        };
        _this.shadowImageSource = function () {
            return require('./resources/assets/' + Constants_1.BOTTOM_SHADOW_IMAGE);
        };
        _this.separatorStyle = function () {
            return Styles_1.styles.topShadow;
        };
        /**
         * V4TODO: There is a bug in bottom bar.
         * Item placement should be controlled with 'bottom' position instead of 'top' position.
         */
        _this.renderItems = function (scrollBehaviourOffset) {
            var children = [];
            var index = 0;
            var topPosition = (_this.props.safeAreaInsets && _this.props.safeAreaInsets.top) || 0;
            for (var _i = 0, _a = _this.props.scrollBehaviours; _i < _a.length; _i++) {
                var scrollBehaviour = _a[_i];
                var content = _this.props.contentRenderer(index, scrollBehaviourOffset);
                var itemMinHeight = _this.props.scrollBehaviours[index].minHeight ? _this.props.scrollBehaviours[index].minHeight : 0;
                var itemMaxHeight = _this.props.scrollBehaviours[index].maxHeight;
                var alpha = scrollBehaviour.scrollEffect & Behaviours_1.CLScrollEffect.FADE
                    ? scrollBehaviourOffset.interpolate({
                        inputRange: [0, 0.5, 0.75],
                        outputRange: [1, 0.25, 0],
                        extrapolate: 'clamp'
                    })
                    : new react_native_1.Animated.Value(1);
                var height = scrollBehaviour.scrollEffect & Behaviours_1.CLScrollEffect.COLLAPSE
                    ? scrollBehaviourOffset.interpolate({
                        inputRange: [0, 1],
                        outputRange: [itemMaxHeight, itemMinHeight],
                        extrapolate: 'clamp'
                    })
                    : new react_native_1.Animated.Value(itemMaxHeight);
                var item = (<react_native_1.Animated.View key={index} style={{
                    position: 'absolute',
                    top: topPosition,
                    left: 0,
                    right: 0,
                    opacity: alpha,
                    height: height,
                    zIndex: index,
                    overflow: 'hidden'
                }}>
                    {content}
                </react_native_1.Animated.View>);
                children.push(item);
                topPosition += itemMaxHeight;
                index++;
            }
            return children;
        };
        return _this;
    }
    return CLBottomBar;
}(CLAppBar));
exports.CLBottomBar = CLBottomBar;
//# sourceMappingURL=Bars.js.map