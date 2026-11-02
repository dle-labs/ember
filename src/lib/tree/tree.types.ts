/**
 * A node in the tree. Can have any extra properties
 */
export type Node<T extends object = object> = T & {
	/** Globally unique ID; records must use the same ID as their key. */
	id: string;
	/** Legacy Tree expansion. TreeView keeps expansion in expandedIds. */
	expanded?: boolean;
	children?: Record<string, Node<T>>;
	/*
	 * Any other properties you want to add to the node
	 */
	[key: string | number]: unknown;
};

/**
 * The complete accordion tree. This is a record of nodes with children
 */
export type TreeData<T extends object = object> = Record<string, Node<T>>;
