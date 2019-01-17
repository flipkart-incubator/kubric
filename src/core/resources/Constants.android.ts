import { StyleSheet } from 'react-native';

export const SEPARATOR_HEIGHT: number = 3;

export const TOP_SHADOW_IMAGE: string = 'shadow_top';
export const BOTTOM_SHADOW_IMAGE: string = 'https://rukminim1.flixcart.com/www/30/10/promos/01/08/2018/e364d9fe-1225-4814-bfee-2c461bf1c442.png?q=100';

export const CLEAR_COLOR: string = '#fff0';

export const shadowStyles = StyleSheet.create({
    topShadow: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: SEPARATOR_HEIGHT
    },
    bottomShadow: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: SEPARATOR_HEIGHT
    }
});
