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
import { Element } from 'domhandler'

export type TransformSettings = {
    baseFontSize: number;
}

export type TransformerData = {
    element: React.ReactElement | null;
    children: React.ReactElement | React.ReactElement[] | null;
    domNode: Element;
    index: number;
    key: string | null;
    settings: TransformSettings;
}

export type Transformer = (data: TransformerData) => React.ReactElement | null;

export type FlatDomItem = {
    element: JSX.Element,
    parentElement: JSX.Element | null;
    parent: FlatDomItem | null;
    index: number;
};

export type ElementProps = ViewProps | SVGProps | LineProps | PolylineProps | PolygonProps | PathProps | RectProps |
    CircleProps | EllipseProps | SVGTextProps | TspanProps | GProps | StopProps | DefsProps |
    ClipPathProps | LinearGradientProps | RadialGradientProps;

export type PropsUpdateQuery = {
    [selector: string]: ElementProps | ((props: ElementProps) => ElementProps);
}

export type StyleUpdateQuery = {
    [selector: string]: Style | ((props: ElementProps) => ElementProps)
}

export type SvgWrapperProps = React.PropsWithChildren<{
    reachartResponsive?: boolean;
    baseFontSize?: number;
    propsUpdateQuery?: PropsUpdateQuery;
    styleUpdateQuery?: StyleUpdateQuery;
}>