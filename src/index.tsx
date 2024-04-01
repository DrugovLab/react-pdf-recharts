import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server';
import { domToReact, HTMLReactParserOptions } from 'html-react-parser'
import { ElementType } from 'domelementtype'
import { SvgWrapperProps, StyleUpdateQuery } from './types';
import {
    CircleConverter,
    ClipPathConverter,
    DefsConverter,
    DivConverter,
    EllipseConverter,
    GConverter,
    LiConverter,
    LineConverter,
    LinearGradientConverter,
    PathConverter,
    PolylineConverter,
    PolygonConverter,
    RadialGradientConverter,
    RectConverter,
    SpanConverter,
    StopConverter,
    SvgConverter,
    TextConverter,
    TspanConverter,
    UlConverter,
    ViewConverter,
    INodeConverter
} from './converters';
import htmlToDOM from 'html-dom-parser';
import CSSselect from 'css-select'
import deepmerge from 'deepmerge';

const converters: INodeConverter[] = [
    DivConverter,
    ViewConverter,
    SvgConverter,
    LineConverter,
    PolylineConverter,
    PolygonConverter,
    PathConverter,
    RectConverter,
    CircleConverter,
    EllipseConverter,
    TextConverter,
    TspanConverter,
    SpanConverter,
    // TitleConverter,
    GConverter,
    StopConverter,
    DefsConverter,
    ClipPathConverter,
    LinearGradientConverter,
    RadialGradientConverter,
    UlConverter,
    LiConverter,
];

function convertUnitValue(value: string | number, fontSize: number) {
    const stringValue = value.toString();
    if (stringValue.endsWith('rem')) {
        return Number.parseFloat(stringValue.split('rem')[0]) * fontSize;
    }
    if (stringValue.endsWith('em')) {
        return Number.parseFloat(stringValue.split('em')[0]) * fontSize;
    }
    return value;
}

export default function SvgWrapper(props: SvgWrapperProps) {

    const {
        rechartResponsive = true,
        baseFontSize = 11,
        propsUpdateQuery: elementProps = {},
        styleUpdateQuery: elementStyles = {}
    } = props;

    let html = renderToStaticMarkup(props.children);

    const dom = htmlToDOM(html, { lowerCaseAttributeNames: false });

    const defaultElementStyles: StyleUpdateQuery = {
        'tspan, text, span': {
            fontSize: baseFontSize
        },
        '.recharts-legend-wrapper': {
            position: undefined,
            width: undefined,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
        },
        '.recharts-default-legend': {
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 8,
        },
        '.recharts-legend-item': {
            flexDirection: 'row',
            gap: 4
        },
    }

    if (rechartResponsive) {
        defaultElementStyles['.recharts-wrapper, .recharts-wrapper > svg'] = {
            width: '100%',
            height: 'auto'
        }
    }

    const updatePropsQueries = Object.entries(elementProps).concat(
        Object.entries(defaultElementStyles)
            .concat(Object.entries(elementStyles))
            .map(([selector, style]) => ([selector, { style }]))
    );

    const nodeAdditionalProps = updatePropsQueries.flatMap(([selector, newProps]) =>
        CSSselect(selector, dom).map(node => ({
            node,
            additionalPropsGetter: (currentProps: any) => {
                if (typeof newProps === 'function') {
                    return newProps(currentProps);
                }
                return newProps;
            }
        }))
    );

    const parserOptions: HTMLReactParserOptions = {

        transform(reactNode: any, domNode, index) {

            switch (domNode.type) {
                case ElementType.Text:
                    return domNode.data;
                case ElementType.Tag:

                    const converter = converters.find(x => x.nodeName == domNode.name)?.convert;
                    if (!converter) return null;
                    
                    const { style, strokeDasharray, children, ...otherProps } = reactNode.props;

                    const newProps = {
                        key: otherProps.key || reactNode.key || index
                    } as any;

                    const fontSize = style?.fontSize || baseFontSize;
                    if (style) {
                        newProps.style = {};
                        Object.entries(style)
                            .filter(([prop, value]) => value != null)
                            .forEach(([prop, value]) => {
                                newProps.style[prop] = convertUnitValue(value as any, fontSize);
                            });
                    }
                    if (strokeDasharray) {
                        newProps.strokeDasharray = strokeDasharray.split(' ').join(', ');
                    }
                    if (domNode.name == 'tspan') {
                        newProps.dx = convertUnitValue(otherProps.dx || 0, fontSize);
                        newProps.dy = convertUnitValue(otherProps.dy || 0, fontSize);
                    }

                    let element = converter(deepmerge.all([otherProps, newProps]), children);

                    let finalProps = element.props;
                    nodeAdditionalProps.filter(x => x.node == domNode).forEach(({ additionalPropsGetter }) => {
                        finalProps = deepmerge(finalProps, additionalPropsGetter(finalProps));
                    });
                    element = React.cloneElement(element, finalProps);

                    return element;

                default:
                    return null;
            }
        }
    };

    return domToReact(dom, parserOptions);
}