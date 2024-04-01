import {
    CircleProps,
    ViewProps,
    SVGProps,
    DefsProps,
    EllipseProps,
    GProps,
    LineProps,
    PathProps,
    PolygonProps,
    RectProps,
    StopProps,
    SVGTextProps,
    TspanProps,
    PolylineProps,
    ClipPathProps,
    LinearGradientProps,
    RadialGradientProps
} from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types'

export type ElementProps = ViewProps | SVGProps | LineProps | PolylineProps | PolygonProps | PathProps | RectProps |
    CircleProps | EllipseProps | SVGTextProps | TspanProps | GProps | StopProps | DefsProps |
    ClipPathProps | LinearGradientProps | RadialGradientProps;

export type PropsUpdateQuery = {
    [selector: string]: ElementProps | ((props: ElementProps) => ElementProps);
}

export type StyleUpdateQuery = {
    [selector: string]: Style | ((props: ElementProps) => Style)
}

export type SvgWrapperProps = React.PropsWithChildren<{
    rechartResponsive?: boolean;
    baseFontSize?: number;
    propsUpdateQuery?: PropsUpdateQuery;
    styleUpdateQuery?: StyleUpdateQuery;
}>