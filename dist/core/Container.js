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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var react_native_1 = require("react-native");
var Styles_1 = require("./resources/Styles");
var Bars_1 = require("./Bars");
var Behaviours_1 = require("./Behaviours");
var ANIMATION_DURATION = 300;
var MIN_ANIMATION_DURATION = 150;
var CLContainer = /** @class */ (function (_super) {
    __extends(CLContainer, _super);
    function CLContainer(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this._scrollBehaviourOffset = 0;
        _this._scrollBehaviourOffsetAnimatedValue = new react_native_1.Animated.Value(0);
        _this._lastOffsetY = 0;
        _this._minPaddingY = 0;
        _this._maxPaddingY = 0;
        _this._cummulativeDimensionRange = {
            appBar: { minHeight: 0, maxHeight: 0 },
            bottomBar: { minHeight: 0, maxHeight: 0 }
        };
        _this._contentSize = { width: 0, height: 0 };
        _this._scrollviewLayout = { x: 0, y: 0, width: 0, height: 0 };
        _this._animating = false;
        _this._onContentSizeChange = function (w, h) {
            _this._contentSize.width = w;
            _this._contentSize.height = h;
        };
        _this._onScrollEndDrag = function (event) {
            var nativeEvent = event && event.nativeEvent;
            if (nativeEvent && nativeEvent.velocity && nativeEvent.velocity.y !== 0) {
                return;
            }
            _this._finishTransition();
        };
        _this._onMomentumScrollEnd = function (event) {
            var nativeEvent = event && event.nativeEvent;
            if (!nativeEvent || (nativeEvent && ((nativeEvent.velocity && nativeEvent.velocity.y === 0) || nativeEvent.velocity === undefined))) {
                _this._finishTransition();
            }
        };
        _this._calculateBehaviour = function (newProps) {
            var safeAreaInsets = newProps.safeAreaInsets ? newProps.safeAreaInsets : { top: 0, left: 0, bottom: 0, right: 0 };
            var cummulativeAppBarDimensionRange;
            var cummulativeBottomBarDimensionRange;
            var hasAppBar = newProps.appBarScrollBehaviours && newProps.appBarScrollBehaviours.length > 0 && newProps.appBarContentRenderer !== undefined;
            var hasBottomBar = newProps.bottomBarScrollBehaviours && newProps.bottomBarScrollBehaviours.length > 0 && newProps.bottomBarContentRenderer !== undefined;
            if (newProps.appBarScrollBehaviours) {
                cummulativeAppBarDimensionRange = _this._calculateBehaviourForBar(newProps.appBarScrollBehaviours, __assign({}, safeAreaInsets, { bottom: 0, top: hasAppBar ? safeAreaInsets.top : 0 }));
            }
            else {
                cummulativeAppBarDimensionRange = { minHeight: 0, maxHeight: 0 };
            }
            if (newProps.bottomBarScrollBehaviours) {
                cummulativeBottomBarDimensionRange = _this._calculateBehaviourForBar(newProps.bottomBarScrollBehaviours, __assign({}, safeAreaInsets, { top: 0, bottom: hasBottomBar ? safeAreaInsets.bottom : 0 }));
            }
            else {
                cummulativeBottomBarDimensionRange = { minHeight: 0, maxHeight: 0 };
            }
            return {
                appBar: {
                    minHeight: cummulativeAppBarDimensionRange.minHeight,
                    maxHeight: cummulativeAppBarDimensionRange.maxHeight
                },
                bottomBar: {
                    minHeight: cummulativeBottomBarDimensionRange.minHeight,
                    maxHeight: cummulativeBottomBarDimensionRange.maxHeight
                }
            };
        };
        _this._calculateBehaviourForBar = function (scrollBehaviours, safeAreaInsets) {
            var _deducedItemDimensionBehaviours = [];
            var minHeight = safeAreaInsets ? (safeAreaInsets.top || 0) + (safeAreaInsets.bottom || 0) : 0;
            var maxHeight = minHeight;
            for (var _i = 0, scrollBehaviours_1 = scrollBehaviours; _i < scrollBehaviours_1.length; _i++) {
                var behaviour = scrollBehaviours_1[_i];
                var deducedDimensionRange = { minHeight: 0, maxHeight: behaviour.maxHeight };
                if (behaviour.scrollEffect & Behaviours_1.CLScrollEffect.COLLAPSE) {
                    deducedDimensionRange.minHeight = behaviour.minHeight;
                }
                else if ((behaviour.scrollEffect & Behaviours_1.CLScrollEffect.SCROLL) === Behaviours_1.CLScrollEffect.NONE) {
                    deducedDimensionRange.minHeight = behaviour.maxHeight;
                }
                _deducedItemDimensionBehaviours.push(deducedDimensionRange);
                minHeight += deducedDimensionRange.minHeight;
                maxHeight += deducedDimensionRange.maxHeight;
            }
            return { minHeight: minHeight, maxHeight: maxHeight };
        };
        _this._animateToScrollBehaviourOffset = function (targetOffset, from, animate) {
            if (animate) {
                if (_this._animating) {
                    return;
                }
                _this._animating = true;
                var fromOffset = from ? from : targetOffset > 0.5 ? 1 : 0;
                var duration = Math.max((targetOffset > fromOffset ? 1 : -1) * (targetOffset - fromOffset) * ANIMATION_DURATION, MIN_ANIMATION_DURATION);
                react_native_1.Animated.timing(_this._scrollBehaviourOffsetAnimatedValue, {
                    toValue: targetOffset,
                    duration: duration,
                    easing: react_native_1.Easing.ease
                }).start(function (_result) {
                    _this._scrollBehaviourOffset = targetOffset;
                    _this._animating = false;
                    _this._notifyProgress();
                });
            }
        };
        _this._updateScrollBehavior = function (nextY) {
            var delta = (nextY - _this._lastOffsetY) / (_this._maxPaddingY - _this._minPaddingY);
            _this._scrollDirection = delta > 0 ? 'down' : delta < 0 ? 'up' : _this._scrollDirection;
            var nextOffset = _this._scrollBehaviourOffset + delta;
            _this._setBehaviourOffset(nextOffset);
            _this._lastOffsetY = nextY;
        };
        _this._onScrollViewLayout = function (event) {
            if (_this.props.onLayout) {
                _this.props.onLayout(event);
            }
            var rectangle = event.nativeEvent.layout;
            _this._scrollviewLayout.width = rectangle.width;
            _this._scrollviewLayout.height = rectangle.height;
        };
        _this._scrollListner = function (event) {
            if (_this._animating) {
                return;
            }
            if (event) {
                var nextY = event.nativeEvent.contentOffset.y;
                var isOffsetWithinBounds = nextY + event.nativeEvent.layoutMeasurement.height <= event.nativeEvent.contentSize.height;
                var isContentHeightGreaterThanLayout = nextY > event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
                if (nextY < 0 || isContentHeightGreaterThanLayout || !isOffsetWithinBounds) {
                    return;
                }
                _this._updateScrollBehavior(nextY);
            }
        };
        _this._cummulativeDimensionRange = _this._calculateBehaviour(_this.props);
        return _this;
    }
    CLContainer.prototype.componentWillMount = function () {
        if (this.props.offset) {
            this._setBehaviourOffset(this.props.offset);
        }
    };
    CLContainer.prototype.componentWillReceiveProps = function (nextProps, _nextContext) {
        this._cummulativeDimensionRange = this._calculateBehaviour(nextProps);
        if (this.props.offset !== nextProps.offset) {
            this._setBehaviourOffset(nextProps.offset ? nextProps.offset : 0);
        }
    };
    CLContainer.prototype.render = function () {
        var hasScroller = this.props.renderScrollComponent !== undefined;
        var hasAppBar = this.props.appBarScrollBehaviours && this.props.appBarScrollBehaviours.length > 0 && this.props.appBarContentRenderer !== undefined;
        var hasBottomBar = this.props.bottomBarScrollBehaviours && this.props.bottomBarScrollBehaviours.length > 0 && this.props.bottomBarContentRenderer !== undefined;
        var safeAreaInsets = this.props.safeAreaInsets ? this.props.safeAreaInsets : { top: 0, left: 0, bottom: 0, right: 0 };
        var paddingTop = hasAppBar ? 0 : safeAreaInsets.top;
        var paddingBottom = hasBottomBar ? 0 : safeAreaInsets.bottom;
        this._minPaddingY = this._cummulativeDimensionRange.appBar.minHeight + this._cummulativeDimensionRange.bottomBar.minHeight;
        this._maxPaddingY = this._cummulativeDimensionRange.appBar.maxHeight + this._cummulativeDimensionRange.bottomBar.maxHeight;
        var scrollBehvavioutOffsetInterpolation = this._scrollBehaviourOffsetAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp'
        });
        if (!hasScroller && !hasAppBar && !hasBottomBar) {
            return <react_native_1.View style={[Styles_1.styles.fill, this.props.style]}/>;
        }
        return (<react_native_1.View style={[{ flex: 1, paddingBottom: paddingBottom, paddingTop: paddingTop }, this.props.style]}>
                {this.props.renderScrollComponent
            ? this.props.renderScrollComponent({
                contentContainerStyle: { paddingTop: this._cummulativeDimensionRange.appBar.maxHeight, paddingBottom: this._cummulativeDimensionRange.bottomBar.minHeight },
                style: { flex: 1 },
                scrollEventThrottle: 16,
                onScroll: this._maxPaddingY === this._minPaddingY ? undefined : this._scrollListner,
                onScrollEndDrag: this._onScrollEndDrag,
                onMomentumScrollEnd: this._onMomentumScrollEnd,
                onContentSizeChange: this._onContentSizeChange,
                onLayout: this._onScrollViewLayout
            })
            : undefined}

                {this.props.appBarContentRenderer && this.props.appBarScrollBehaviours !== undefined ? (this.props.renderAppBar ? (this.props.renderAppBar({
            style: Styles_1.styles.header,
            safeAreaInsets: __assign({}, safeAreaInsets, { bottom: 0 }),
            scrollBehaviourOffset: scrollBehvavioutOffsetInterpolation,
            scrollBehaviours: this.props.appBarScrollBehaviours,
            contentRenderer: this.props.appBarContentRenderer,
            showSeparator: true
        })) : (<Bars_1.CLAppBar style={Styles_1.styles.header} safeAreaInsets={__assign({}, safeAreaInsets, { bottom: 0 })} scrollBehaviourOffset={scrollBehvavioutOffsetInterpolation} scrollBehaviours={this.props.appBarScrollBehaviours} contentRenderer={this.props.appBarContentRenderer} showSeparator={true}/>)) : (undefined)}
                {this.props.bottomBarContentRenderer && this.props.bottomBarScrollBehaviours !== undefined ? (this.props.renderBottomBar ? (this.props.renderBottomBar({
            style: Styles_1.styles.footer,
            safeAreaInsets: __assign({}, safeAreaInsets, { top: 0 }),
            scrollBehaviourOffset: scrollBehvavioutOffsetInterpolation,
            scrollBehaviours: this.props.bottomBarScrollBehaviours,
            contentRenderer: this.props.bottomBarContentRenderer,
            showSeparator: true
        })) : (<Bars_1.CLBottomBar style={Styles_1.styles.footer} safeAreaInsets={__assign({}, safeAreaInsets, { top: 0 })} scrollBehaviourOffset={scrollBehvavioutOffsetInterpolation} scrollBehaviours={this.props.bottomBarScrollBehaviours} contentRenderer={this.props.bottomBarContentRenderer} showSeparator={true}/>)) : (undefined)}
            </react_native_1.View>);
    };
    /**
     * expandLayout
     * Use this method to reset the layout to beginning offset
     */
    CLContainer.prototype.expandLayout = function () {
        this._animateToScrollBehaviourOffset(0, this._scrollBehaviourOffset, true);
    };
    /**
     * collapseLayout
     * Use this method to apply full behaviour offset to bar i.e. collapse the bars
     */
    CLContainer.prototype.collapseLayout = function () {
        this._animateToScrollBehaviourOffset(1, this._scrollBehaviourOffset, true);
    };
    CLContainer.prototype._notifyProgress = function () {
        if (this.props.onProgress) {
            this.props.onProgress(this._scrollBehaviourOffset, this._scrollBehaviourOffsetAnimatedValue, this._cummulativeDimensionRange);
        }
    };
    CLContainer.prototype._setBehaviourOffset = function (nextOffset) {
        this._scrollBehaviourOffset = nextOffset > 1 ? 1 : nextOffset < 0 ? 0 : nextOffset;
        this._scrollBehaviourOffsetAnimatedValue.setValue(this._scrollBehaviourOffset);
        this._notifyProgress();
    };
    CLContainer.prototype._finishTransition = function () {
        if (this._scrollBehaviourOffset === 0 || this._scrollBehaviourOffset === 1) {
            return;
        }
        var targetOffset;
        if (this._lastOffsetY < this._cummulativeDimensionRange.appBar.maxHeight) {
            targetOffset = 0;
        }
        else if (this._scrollDirection === 'up') {
            targetOffset = this._scrollBehaviourOffset < 0.1 ? 0 : 1;
        }
        else if (this._scrollDirection === 'down') {
            targetOffset = this._scrollBehaviourOffset > 0.9 ? 1 : 0;
        }
        else {
            targetOffset = this._scrollBehaviourOffset < 0.5 ? 0 : 1;
        }
        this._animateToScrollBehaviourOffset(targetOffset, this._scrollBehaviourOffset, true);
    };
    return CLContainer;
}(React.Component));
exports.CLContainer = CLContainer;
/*************************** Experimental, Do NOT delete *****************************/
// export interface BarContentProps extends ViewProperties {
//   scrollBehaviourOffset: Animated.AnimatedInterpolation;
//   scrollBehaviour: CLScrollBehaviour;
// }
// export abstract class BarContent extends React.Component<BarContentProps, any> {
//     getScrollBehaviour(): CLScrollBehaviour {
//         return this.props.scrollBehaviour;
//     }
//     abstract getDimensionBehaviour(): CLDimensionBehaviour;
//     abstract render(): JSX.Element;
// }
// export class BaseBarContent extends BarContent {
//     private _maxHeight: number = 0;
//     private _minHeight: number = 0;
//     constructor(props: BarContentProps) {
//         super(props);
//         this.getDimensionBehaviour = this.getDimensionBehaviour.bind(this);
//         this.getScrollBehaviour = this.getScrollBehaviour.bind(this);
//         this._maxHeight = 66;
//         if (this.props.scrollBehaviour | CLScrollBehaviour.SCROLL) {
//             this._minHeight = 0;
//         }
//     }
//     getDimensionBehaviour() {
//         return { maxHeight: this._maxHeight, minHeight: this._minHeight };
//     }
//     render() {
//         // debugger;
//         const height = this.props.scrollBehaviourOffset.interpolate({
//             inputRange: [0, 1],
//             outputRange: [this._maxHeight, this._minHeight],
//             extrapolate: 'clamp'
//         });
//         return (
//             <Animated.View style={[styles.barContent, { height: height }]} {...this.props}>
//                 <Text>BottomBarContent</Text>
//             </Animated.View>
//         );
//     }
// }
// }
//# sourceMappingURL=Container.js.map