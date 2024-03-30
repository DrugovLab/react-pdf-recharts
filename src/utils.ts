import React from "react";
import { FlatDomItem } from "./types";
import CSSSelectAdapter from "./CSSSelectAdapter";
import CSSselect from 'css-select'
import deepmerge from "deepmerge";

function convertEm(value: number, baseFontSize: number) {
    return value * baseFontSize;
}

export function convertUnitValue(value: string | number, baseFontSize: number) {
    const stringValue = value.toString();
    if (stringValue.endsWith('%')) {
        return value;
    }
    if (stringValue.endsWith('em')) {
        return convertEm(Number.parseFloat(stringValue.split('em')[0]), baseFontSize);
    }
    if (stringValue.endsWith('px')) {
        return Number.parseFloat(stringValue.split('px')[0]);
    }
    if (Number.isInteger(stringValue)) {
        return Number.parseFloat(stringValue);
    }
    return value;
}

function getChildDom(parent: FlatDomItem): FlatDomItem[] {

    const items: FlatDomItem[] = [];

    React.Children.forEach(parent.element.props.children, (child, index) => {
        if (React.isValidElement(child)) {
            const item = { element: child, parentElement: parent.element, parent, index };
            items.push(item);
            items.push(...getChildDom(item));
        }
    });

    return items;
}

export function createFlatDom(root: React.ReactNode): FlatDomItem[] {

    const items: FlatDomItem[] = [];

    React.Children.forEach(root, (child, index) => {
        if (React.isValidElement(child)) {
            const item = { element: child, parentElement: null, parent: null, index };
            items.push(item);
            items.push(...getChildDom(item));
        }
    });

    return items;
}

function updateItemInParent(item: FlatDomItem) {
    if (item.parent == null) return;

    const parent = item.parent.element;
    if (Array.isArray(parent.props.children)) {
        parent.props.children[item.index] = item.element;
    } else {
        item.parent.element = React.cloneElement(parent, parent.props, item.element);
        updateItemInParent(item.parent);
    }
}

export function updateProperties(root: React.ReactNode, selector: string, props: object | ((currentProps: object) => object)) {

    const dom = createFlatDom(root);
    const items = CSSselect(selector, dom, {
        adapter: new CSSSelectAdapter(dom)
    });

    const getProps = (currentProps: object) => {
        if (typeof props === 'function') {
            return props(currentProps);
        }
        return props;
    }

    items.forEach(item => {
        const { children: _, ...baseElementProps } = item.element.props || {};
        item.element = React.cloneElement(item.element, deepmerge.all([baseElementProps, getProps(baseElementProps)]));
        updateItemInParent(item);
    });
    return dom.filter(x => x.parentElement == null).map(x => x.element);
}

