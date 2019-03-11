import { StyleSheet } from 'react-native';
import { SEPARATOR_HEIGHT } from './Constants';

export const styles = StyleSheet.create({
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
        width: '100%',
        height: SEPARATOR_HEIGHT
    },
    bottomShadow: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: SEPARATOR_HEIGHT
    }
});
