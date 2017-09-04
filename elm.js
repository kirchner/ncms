
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_lang$core$Native_Bitwise = function() {

return {
	and: F2(function and(a, b) { return a & b; }),
	or: F2(function or(a, b) { return a | b; }),
	xor: F2(function xor(a, b) { return a ^ b; }),
	complement: function complement(a) { return ~a; },
	shiftLeftBy: F2(function(offset, a) { return a << offset; }),
	shiftRightBy: F2(function(offset, a) { return a >> offset; }),
	shiftRightZfBy: F2(function(offset, a) { return a >>> offset; })
};

}();

var _elm_lang$core$Bitwise$shiftRightZfBy = _elm_lang$core$Native_Bitwise.shiftRightZfBy;
var _elm_lang$core$Bitwise$shiftRightBy = _elm_lang$core$Native_Bitwise.shiftRightBy;
var _elm_lang$core$Bitwise$shiftLeftBy = _elm_lang$core$Native_Bitwise.shiftLeftBy;
var _elm_lang$core$Bitwise$complement = _elm_lang$core$Native_Bitwise.complement;
var _elm_lang$core$Bitwise$xor = _elm_lang$core$Native_Bitwise.xor;
var _elm_lang$core$Bitwise$or = _elm_lang$core$Native_Bitwise.or;
var _elm_lang$core$Bitwise$and = _elm_lang$core$Native_Bitwise.and;

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _truqu$elm_base64$Base64_Decode$charToInt = function ($char) {
	var _p0 = $char;
	switch (_p0.valueOf()) {
		case 'A':
			return 0;
		case 'B':
			return 1;
		case 'C':
			return 2;
		case 'D':
			return 3;
		case 'E':
			return 4;
		case 'F':
			return 5;
		case 'G':
			return 6;
		case 'H':
			return 7;
		case 'I':
			return 8;
		case 'J':
			return 9;
		case 'K':
			return 10;
		case 'L':
			return 11;
		case 'M':
			return 12;
		case 'N':
			return 13;
		case 'O':
			return 14;
		case 'P':
			return 15;
		case 'Q':
			return 16;
		case 'R':
			return 17;
		case 'S':
			return 18;
		case 'T':
			return 19;
		case 'U':
			return 20;
		case 'V':
			return 21;
		case 'W':
			return 22;
		case 'X':
			return 23;
		case 'Y':
			return 24;
		case 'Z':
			return 25;
		case 'a':
			return 26;
		case 'b':
			return 27;
		case 'c':
			return 28;
		case 'd':
			return 29;
		case 'e':
			return 30;
		case 'f':
			return 31;
		case 'g':
			return 32;
		case 'h':
			return 33;
		case 'i':
			return 34;
		case 'j':
			return 35;
		case 'k':
			return 36;
		case 'l':
			return 37;
		case 'm':
			return 38;
		case 'n':
			return 39;
		case 'o':
			return 40;
		case 'p':
			return 41;
		case 'q':
			return 42;
		case 'r':
			return 43;
		case 's':
			return 44;
		case 't':
			return 45;
		case 'u':
			return 46;
		case 'v':
			return 47;
		case 'w':
			return 48;
		case 'x':
			return 49;
		case 'y':
			return 50;
		case 'z':
			return 51;
		case '0':
			return 52;
		case '1':
			return 53;
		case '2':
			return 54;
		case '3':
			return 55;
		case '4':
			return 56;
		case '5':
			return 57;
		case '6':
			return 58;
		case '7':
			return 59;
		case '8':
			return 60;
		case '9':
			return 61;
		case '+':
			return 62;
		case '/':
			return 63;
		default:
			return 0;
	}
};
var _truqu$elm_base64$Base64_Decode$intToString = function ($int) {
	if (_elm_lang$core$Native_Utils.cmp($int, 65536) < 1) {
		return _elm_lang$core$String$fromChar(
			_elm_lang$core$Char$fromCode($int));
	} else {
		var c = $int - 65536;
		return _elm_lang$core$String$fromList(
			{
				ctor: '::',
				_0: _elm_lang$core$Char$fromCode(55296 | (c >>> 10)),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Char$fromCode(56320 | (1023 & c)),
					_1: {ctor: '[]'}
				}
			});
	}
};
var _truqu$elm_base64$Base64_Decode$add = F2(
	function ($char, _p1) {
		var _p2 = _p1;
		var _p4 = _p2._2;
		var _p3 = _p2._1;
		var shiftAndAdd = function ($int) {
			return (63 & $int) | (_p2._0 << 6);
		};
		return _elm_lang$core$Native_Utils.eq(_p3, 0) ? (_elm_lang$core$Native_Utils.eq(128 & $char, 0) ? {
			ctor: '_Tuple3',
			_0: 0,
			_1: 0,
			_2: A2(
				_elm_lang$core$Basics_ops['++'],
				_p4,
				_truqu$elm_base64$Base64_Decode$intToString($char))
		} : (_elm_lang$core$Native_Utils.eq(224 & $char, 192) ? {ctor: '_Tuple3', _0: 31 & $char, _1: 1, _2: _p4} : (_elm_lang$core$Native_Utils.eq(240 & $char, 224) ? {ctor: '_Tuple3', _0: 15 & $char, _1: 2, _2: _p4} : {ctor: '_Tuple3', _0: 7 & $char, _1: 3, _2: _p4}))) : (_elm_lang$core$Native_Utils.eq(_p3, 1) ? {
			ctor: '_Tuple3',
			_0: 0,
			_1: 0,
			_2: A2(
				_elm_lang$core$Basics_ops['++'],
				_p4,
				_truqu$elm_base64$Base64_Decode$intToString(
					shiftAndAdd($char)))
		} : {
			ctor: '_Tuple3',
			_0: shiftAndAdd($char),
			_1: _p3 - 1,
			_2: _p4
		});
	});
var _truqu$elm_base64$Base64_Decode$toUTF16 = F2(
	function ($char, acc) {
		return {
			ctor: '_Tuple3',
			_0: 0,
			_1: 0,
			_2: A2(
				_truqu$elm_base64$Base64_Decode$add,
				255 & ($char >>> 0),
				A2(
					_truqu$elm_base64$Base64_Decode$add,
					255 & ($char >>> 8),
					A2(_truqu$elm_base64$Base64_Decode$add, 255 & ($char >>> 16), acc)))
		};
	});
var _truqu$elm_base64$Base64_Decode$chomp = F2(
	function (char_, _p5) {
		var _p6 = _p5;
		var _p10 = _p6._2;
		var _p9 = _p6._0;
		var _p8 = _p6._1;
		var $char = _truqu$elm_base64$Base64_Decode$charToInt(char_);
		var _p7 = _p8;
		if (_p7 === 3) {
			return A2(_truqu$elm_base64$Base64_Decode$toUTF16, _p9 | $char, _p10);
		} else {
			return {ctor: '_Tuple3', _0: ($char << ((3 - _p8) * 6)) | _p9, _1: _p8 + 1, _2: _p10};
		}
	});
var _truqu$elm_base64$Base64_Decode$initial = {
	ctor: '_Tuple3',
	_0: 0,
	_1: 0,
	_2: {ctor: '_Tuple3', _0: 0, _1: 0, _2: ''}
};
var _truqu$elm_base64$Base64_Decode$wrapUp = function (_p11) {
	var _p12 = _p11;
	return (_elm_lang$core$Native_Utils.cmp(_p12._2._1, 0) > 0) ? _elm_lang$core$Result$Err('Invalid UTF-16') : _elm_lang$core$Result$Ok(_p12._2._2);
};
var _truqu$elm_base64$Base64_Decode$stripNulls = F2(
	function (input, output) {
		return (A2(_elm_lang$core$String$endsWith, '==', input) && A2(_elm_lang$core$String$endsWith, '  ', output)) ? A2(_elm_lang$core$String$dropRight, 2, output) : ((A2(_elm_lang$core$String$endsWith, '=', input) && A2(_elm_lang$core$String$endsWith, ' ', output)) ? A2(_elm_lang$core$String$dropRight, 1, output) : output);
	});
var _truqu$elm_base64$Base64_Decode$validBase64Regex = _elm_lang$core$Regex$regex('^([A-Za-z0-9\\/+]{4})*([A-Za-z0-9\\/+]{2}[A-Za-z0-9\\/+=]{2})?$');
var _truqu$elm_base64$Base64_Decode$validate = function (input) {
	return A2(_elm_lang$core$Regex$contains, _truqu$elm_base64$Base64_Decode$validBase64Regex, input) ? _elm_lang$core$Result$Ok(input) : _elm_lang$core$Result$Err('Invalid base64');
};
var _truqu$elm_base64$Base64_Decode$decode = function (input) {
	return A2(
		_elm_lang$core$Result$map,
		_truqu$elm_base64$Base64_Decode$stripNulls(input),
		A2(
			_elm_lang$core$Result$andThen,
			function (_p13) {
				return _truqu$elm_base64$Base64_Decode$wrapUp(
					A3(_elm_lang$core$String$foldl, _truqu$elm_base64$Base64_Decode$chomp, _truqu$elm_base64$Base64_Decode$initial, _p13));
			},
			_truqu$elm_base64$Base64_Decode$validate(input)));
};

var _truqu$elm_base64$Base64_Encode$intToBase64 = function (i) {
	var _p0 = i;
	switch (_p0) {
		case 0:
			return 'A';
		case 1:
			return 'B';
		case 2:
			return 'C';
		case 3:
			return 'D';
		case 4:
			return 'E';
		case 5:
			return 'F';
		case 6:
			return 'G';
		case 7:
			return 'H';
		case 8:
			return 'I';
		case 9:
			return 'J';
		case 10:
			return 'K';
		case 11:
			return 'L';
		case 12:
			return 'M';
		case 13:
			return 'N';
		case 14:
			return 'O';
		case 15:
			return 'P';
		case 16:
			return 'Q';
		case 17:
			return 'R';
		case 18:
			return 'S';
		case 19:
			return 'T';
		case 20:
			return 'U';
		case 21:
			return 'V';
		case 22:
			return 'W';
		case 23:
			return 'X';
		case 24:
			return 'Y';
		case 25:
			return 'Z';
		case 26:
			return 'a';
		case 27:
			return 'b';
		case 28:
			return 'c';
		case 29:
			return 'd';
		case 30:
			return 'e';
		case 31:
			return 'f';
		case 32:
			return 'g';
		case 33:
			return 'h';
		case 34:
			return 'i';
		case 35:
			return 'j';
		case 36:
			return 'k';
		case 37:
			return 'l';
		case 38:
			return 'm';
		case 39:
			return 'n';
		case 40:
			return 'o';
		case 41:
			return 'p';
		case 42:
			return 'q';
		case 43:
			return 'r';
		case 44:
			return 's';
		case 45:
			return 't';
		case 46:
			return 'u';
		case 47:
			return 'v';
		case 48:
			return 'w';
		case 49:
			return 'x';
		case 50:
			return 'y';
		case 51:
			return 'z';
		case 52:
			return '0';
		case 53:
			return '1';
		case 54:
			return '2';
		case 55:
			return '3';
		case 56:
			return '4';
		case 57:
			return '5';
		case 58:
			return '6';
		case 59:
			return '7';
		case 60:
			return '8';
		case 61:
			return '9';
		case 62:
			return '+';
		case 63:
			return '/';
		default:
			return '=';
	}
};
var _truqu$elm_base64$Base64_Encode$toBase64 = function ($int) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_truqu$elm_base64$Base64_Encode$intToBase64(63 & ($int >>> 18)),
		A2(
			_elm_lang$core$Basics_ops['++'],
			_truqu$elm_base64$Base64_Encode$intToBase64(63 & ($int >>> 12)),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_truqu$elm_base64$Base64_Encode$intToBase64(63 & ($int >>> 6)),
				_truqu$elm_base64$Base64_Encode$intToBase64(63 & ($int >>> 0)))));
};
var _truqu$elm_base64$Base64_Encode$add = F2(
	function ($char, _p1) {
		var _p2 = _p1;
		var _p5 = _p2._0;
		var _p4 = _p2._1;
		var current = (_p2._2 << 8) | $char;
		var _p3 = _p4;
		if (_p3 === 2) {
			return {
				ctor: '_Tuple3',
				_0: A2(
					_elm_lang$core$Basics_ops['++'],
					_p5,
					_truqu$elm_base64$Base64_Encode$toBase64(current)),
				_1: 0,
				_2: 0
			};
		} else {
			return {ctor: '_Tuple3', _0: _p5, _1: _p4 + 1, _2: current};
		}
	});
var _truqu$elm_base64$Base64_Encode$chomp = F2(
	function (char_, _p6) {
		var _p7 = _p6;
		var _p9 = _p7._1;
		var $char = _elm_lang$core$Char$toCode(char_);
		var _p8 = _p7._0;
		if (_p8.ctor === 'Nothing') {
			return (_elm_lang$core$Native_Utils.cmp($char, 128) < 0) ? {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A2(_truqu$elm_base64$Base64_Encode$add, $char, _p9)
			} : ((_elm_lang$core$Native_Utils.cmp($char, 2048) < 0) ? {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A2(
					_truqu$elm_base64$Base64_Encode$add,
					128 | (63 & $char),
					A2(_truqu$elm_base64$Base64_Encode$add, 192 | ($char >>> 6), _p9))
			} : (((_elm_lang$core$Native_Utils.cmp($char, 55296) < 0) || (_elm_lang$core$Native_Utils.cmp($char, 57344) > -1)) ? {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A2(
					_truqu$elm_base64$Base64_Encode$add,
					128 | (63 & $char),
					A2(
						_truqu$elm_base64$Base64_Encode$add,
						128 | (63 & ($char >>> 6)),
						A2(_truqu$elm_base64$Base64_Encode$add, 224 | ($char >>> 12), _p9)))
			} : {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just($char),
				_1: _p9
			}));
		} else {
			var combined = A2(
				F2(
					function (x, y) {
						return x + y;
					}),
				65536,
				(1023 & $char) | ((1023 & _p8._0) << 10));
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A2(
					_truqu$elm_base64$Base64_Encode$add,
					128 | (63 & combined),
					A2(
						_truqu$elm_base64$Base64_Encode$add,
						128 | (63 & (combined >>> 6)),
						A2(
							_truqu$elm_base64$Base64_Encode$add,
							128 | (63 & (combined >>> 12)),
							A2(_truqu$elm_base64$Base64_Encode$add, 240 | (combined >>> 18), _p9))))
			};
		}
	});
var _truqu$elm_base64$Base64_Encode$wrapUp = function (_p10) {
	var _p11 = _p10;
	var _p14 = _p11._1._0;
	var _p13 = _p11._1._2;
	var _p12 = _p11._1._1;
	switch (_p12) {
		case 1:
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_p14,
				A2(
					_elm_lang$core$Basics_ops['++'],
					_truqu$elm_base64$Base64_Encode$intToBase64(63 & (_p13 >>> 2)),
					A2(
						_elm_lang$core$Basics_ops['++'],
						_truqu$elm_base64$Base64_Encode$intToBase64(63 & (_p13 << 4)),
						'==')));
		case 2:
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_p14,
				A2(
					_elm_lang$core$Basics_ops['++'],
					_truqu$elm_base64$Base64_Encode$intToBase64(63 & (_p13 >>> 10)),
					A2(
						_elm_lang$core$Basics_ops['++'],
						_truqu$elm_base64$Base64_Encode$intToBase64(63 & (_p13 >>> 4)),
						A2(
							_elm_lang$core$Basics_ops['++'],
							_truqu$elm_base64$Base64_Encode$intToBase64(63 & (_p13 << 2)),
							'='))));
		default:
			return _p14;
	}
};
var _truqu$elm_base64$Base64_Encode$notZero = function (i) {
	return _elm_lang$core$Native_Utils.eq(i, 0) ? -1 : i;
};
var _truqu$elm_base64$Base64_Encode$initial = {
	ctor: '_Tuple2',
	_0: _elm_lang$core$Maybe$Nothing,
	_1: {ctor: '_Tuple3', _0: '', _1: 0, _2: 0}
};
var _truqu$elm_base64$Base64_Encode$encode = function (input) {
	return _truqu$elm_base64$Base64_Encode$wrapUp(
		A3(_elm_lang$core$String$foldl, _truqu$elm_base64$Base64_Encode$chomp, _truqu$elm_base64$Base64_Encode$initial, input));
};

var _truqu$elm_base64$Base64$decode = _truqu$elm_base64$Base64_Decode$decode;
var _truqu$elm_base64$Base64$encode = _truqu$elm_base64$Base64_Encode$encode;

var _elm_lang$http$Native_Http = function() {


// ENCODING AND DECODING

function encodeUri(string)
{
	return encodeURIComponent(string);
}

function decodeUri(string)
{
	try
	{
		return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch(e)
	{
		return _elm_lang$core$Maybe$Nothing;
	}
}


// SEND REQUEST

function toTask(request, maybeProgress)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
		});
		xhr.addEventListener('timeout', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
		});
		xhr.addEventListener('load', function() {
			callback(handleResponse(xhr, request.expect.responseToResult));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
		}

		configureRequest(xhr, request);
		send(xhr, request.body);

		return function() { xhr.abort(); };
	});
}

function configureProgress(xhr, maybeProgress)
{
	if (maybeProgress.ctor === 'Nothing')
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function configureRequest(xhr, request)
{
	function setHeader(pair)
	{
		xhr.setRequestHeader(pair._0, pair._1);
	}

	A2(_elm_lang$core$List$map, setHeader, request.headers);
	xhr.responseType = request.expect.responseType;
	xhr.withCredentials = request.withCredentials;

	if (request.timeout.ctor === 'Just')
	{
		xhr.timeout = request.timeout._0;
	}
}

function send(xhr, body)
{
	switch (body.ctor)
	{
		case 'EmptyBody':
			xhr.send();
			return;

		case 'StringBody':
			xhr.setRequestHeader('Content-Type', body._0);
			xhr.send(body._1);
			return;

		case 'FormDataBody':
			xhr.send(body._0);
			return;
	}
}


// RESPONSES

function handleResponse(xhr, responseToResult)
{
	var response = toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadStatus',
			_0: response
		});
	}

	var result = responseToResult(response);

	if (result.ctor === 'Ok')
	{
		return _elm_lang$core$Native_Scheduler.succeed(result._0);
	}
	else
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadPayload',
			_0: result._0,
			_1: response
		});
	}
}

function toResponse(xhr)
{
	return {
		status: { code: xhr.status, message: xhr.statusText },
		headers: parseHeaders(xhr.getAllResponseHeaders()),
		url: xhr.responseURL,
		body: xhr.response
	};
}

function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function expectStringResponse(responseToResult)
{
	return {
		responseType: 'text',
		responseToResult: responseToResult
	};
}

function mapExpect(func, expect)
{
	return {
		responseType: expect.responseType,
		responseToResult: function(response) {
			var convertedResponse = expect.responseToResult(response);
			return A2(_elm_lang$core$Result$map, func, convertedResponse);
		}
	};
}


// BODY

function multipart(parts)
{
	var formData = new FormData();

	while (parts.ctor !== '[]')
	{
		var part = parts._0;
		formData.append(part._0, part._1);
		parts = parts._1;
	}

	return { ctor: 'FormDataBody', _0: formData };
}

return {
	toTask: F2(toTask),
	expectStringResponse: expectStringResponse,
	mapExpect: F2(mapExpect),
	multipart: multipart,
	encodeUri: encodeUri,
	decodeUri: decodeUri
};

}();

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$http$Http_Internal$map = F2(
	function (func, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				expect: A2(_elm_lang$http$Native_Http.mapExpect, func, request.expect)
			});
	});
var _elm_lang$http$Http_Internal$RawRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g};
	});
var _elm_lang$http$Http_Internal$Request = function (a) {
	return {ctor: 'Request', _0: a};
};
var _elm_lang$http$Http_Internal$Expect = {ctor: 'Expect'};
var _elm_lang$http$Http_Internal$FormDataBody = {ctor: 'FormDataBody'};
var _elm_lang$http$Http_Internal$StringBody = F2(
	function (a, b) {
		return {ctor: 'StringBody', _0: a, _1: b};
	});
var _elm_lang$http$Http_Internal$EmptyBody = {ctor: 'EmptyBody'};
var _elm_lang$http$Http_Internal$Header = F2(
	function (a, b) {
		return {ctor: 'Header', _0: a, _1: b};
	});

var _elm_lang$http$Http$decodeUri = _elm_lang$http$Native_Http.decodeUri;
var _elm_lang$http$Http$encodeUri = _elm_lang$http$Native_Http.encodeUri;
var _elm_lang$http$Http$expectStringResponse = _elm_lang$http$Native_Http.expectStringResponse;
var _elm_lang$http$Http$expectJson = function (decoder) {
	return _elm_lang$http$Http$expectStringResponse(
		function (response) {
			return A2(_elm_lang$core$Json_Decode$decodeString, decoder, response.body);
		});
};
var _elm_lang$http$Http$expectString = _elm_lang$http$Http$expectStringResponse(
	function (response) {
		return _elm_lang$core$Result$Ok(response.body);
	});
var _elm_lang$http$Http$multipartBody = _elm_lang$http$Native_Http.multipart;
var _elm_lang$http$Http$stringBody = _elm_lang$http$Http_Internal$StringBody;
var _elm_lang$http$Http$jsonBody = function (value) {
	return A2(
		_elm_lang$http$Http_Internal$StringBody,
		'application/json',
		A2(_elm_lang$core$Json_Encode$encode, 0, value));
};
var _elm_lang$http$Http$emptyBody = _elm_lang$http$Http_Internal$EmptyBody;
var _elm_lang$http$Http$header = _elm_lang$http$Http_Internal$Header;
var _elm_lang$http$Http$request = _elm_lang$http$Http_Internal$Request;
var _elm_lang$http$Http$post = F3(
	function (url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'POST',
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$get = F2(
	function (url, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {ctor: '[]'},
				url: url,
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$getString = function (url) {
	return _elm_lang$http$Http$request(
		{
			method: 'GET',
			headers: {ctor: '[]'},
			url: url,
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
};
var _elm_lang$http$Http$toTask = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$http$Native_Http.toTask, _p1._0, _elm_lang$core$Maybe$Nothing);
};
var _elm_lang$http$Http$send = F2(
	function (resultToMessage, request) {
		return A2(
			_elm_lang$core$Task$attempt,
			resultToMessage,
			_elm_lang$http$Http$toTask(request));
	});
var _elm_lang$http$Http$Response = F4(
	function (a, b, c, d) {
		return {url: a, status: b, headers: c, body: d};
	});
var _elm_lang$http$Http$BadPayload = F2(
	function (a, b) {
		return {ctor: 'BadPayload', _0: a, _1: b};
	});
var _elm_lang$http$Http$BadStatus = function (a) {
	return {ctor: 'BadStatus', _0: a};
};
var _elm_lang$http$Http$NetworkError = {ctor: 'NetworkError'};
var _elm_lang$http$Http$Timeout = {ctor: 'Timeout'};
var _elm_lang$http$Http$BadUrl = function (a) {
	return {ctor: 'BadUrl', _0: a};
};
var _elm_lang$http$Http$StringPart = F2(
	function (a, b) {
		return {ctor: 'StringPart', _0: a, _1: b};
	});
var _elm_lang$http$Http$stringPart = _elm_lang$http$Http$StringPart;

var _aforemny$ncms$Ncms_Github_ops = _aforemny$ncms$Ncms_Github_ops || {};
_aforemny$ncms$Ncms_Github_ops['|='] = F2(
	function (mf, mx) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (f) {
				return A2(_elm_lang$core$Json_Decode$map, f, mx);
			},
			mf);
	});
var _aforemny$ncms$Ncms_Github$succeed = _elm_lang$core$Json_Decode$succeed;
var _aforemny$ncms$Ncms_Github$defaultBlob = {content: '', encoding: '', url: '', sha: '', size: -1};
var _aforemny$ncms$Ncms_Github$defaultObject = {type_: '', sha: '', url: ''};
var _aforemny$ncms$Ncms_Github$defaultReference = {ref: '', url: '', object: _aforemny$ncms$Ncms_Github$defaultObject};
var _aforemny$ncms$Ncms_Github$defaultFile = {path: '', mode: '', type_: '', size: _elm_lang$core$Maybe$Nothing, sha: '', url: ''};
var _aforemny$ncms$Ncms_Github$defaultTree = {
	sha: '',
	url: '',
	tree: {ctor: '[]'},
	truncated: false
};
var _aforemny$ncms$Ncms_Github$defaultUser = {login: '', id: -1, avatarUrl: '', gravatarId: '', url: '', htmlUrl: '', followersUrl: '', followingUrl: '', gistsUrl: '', starredUrl: '', subscriptionsUrl: '', organizationsUrl: '', reposUrl: '', eventsUrl: '', receivedEventsUrl: '', type_: '', siteAdmin: false, name: '', company: _elm_lang$core$Maybe$Nothing, blog: '', location: '', email: _elm_lang$core$Maybe$Nothing, hireable: _elm_lang$core$Maybe$Nothing, bio: _elm_lang$core$Maybe$Nothing, publicRepos: -1, publicGists: -1, followers: -1, following: -1, createdAt: '2000-01-00T00:00:00Z', updatedAt: '2000-01-00T00:00:00Z'};
var _aforemny$ncms$Ncms_Github$User = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return function (w) {
																							return function (x) {
																								return function (y) {
																									return function (z) {
																										return function (_1) {
																											return function (_2) {
																												return function (_3) {
																													return function (_4) {
																														return {login: a, id: b, avatarUrl: c, gravatarId: d, url: e, htmlUrl: f, followersUrl: g, followingUrl: h, gistsUrl: i, starredUrl: j, subscriptionsUrl: k, organizationsUrl: l, reposUrl: m, eventsUrl: n, receivedEventsUrl: o, type_: p, siteAdmin: q, name: r, company: s, blog: t, location: u, email: v, hireable: w, bio: x, publicRepos: y, publicGists: z, followers: _1, following: _2, createdAt: _3, updatedAt: _4};
																													};
																												};
																											};
																										};
																									};
																								};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _aforemny$ncms$Ncms_Github$user = function (accessToken) {
	var decode = A2(
		_aforemny$ncms$Ncms_Github_ops['|='],
		A2(
			_aforemny$ncms$Ncms_Github_ops['|='],
			A2(
				_aforemny$ncms$Ncms_Github_ops['|='],
				A2(
					_aforemny$ncms$Ncms_Github_ops['|='],
					A2(
						_aforemny$ncms$Ncms_Github_ops['|='],
						A2(
							_aforemny$ncms$Ncms_Github_ops['|='],
							A2(
								_aforemny$ncms$Ncms_Github_ops['|='],
								A2(
									_aforemny$ncms$Ncms_Github_ops['|='],
									A2(
										_aforemny$ncms$Ncms_Github_ops['|='],
										A2(
											_aforemny$ncms$Ncms_Github_ops['|='],
											A2(
												_aforemny$ncms$Ncms_Github_ops['|='],
												A2(
													_aforemny$ncms$Ncms_Github_ops['|='],
													A2(
														_aforemny$ncms$Ncms_Github_ops['|='],
														A2(
															_aforemny$ncms$Ncms_Github_ops['|='],
															A2(
																_aforemny$ncms$Ncms_Github_ops['|='],
																A2(
																	_aforemny$ncms$Ncms_Github_ops['|='],
																	A2(
																		_aforemny$ncms$Ncms_Github_ops['|='],
																		A2(
																			_aforemny$ncms$Ncms_Github_ops['|='],
																			A2(
																				_aforemny$ncms$Ncms_Github_ops['|='],
																				A2(
																					_aforemny$ncms$Ncms_Github_ops['|='],
																					A2(
																						_aforemny$ncms$Ncms_Github_ops['|='],
																						A2(
																							_aforemny$ncms$Ncms_Github_ops['|='],
																							A2(
																								_aforemny$ncms$Ncms_Github_ops['|='],
																								A2(
																									_aforemny$ncms$Ncms_Github_ops['|='],
																									A2(
																										_aforemny$ncms$Ncms_Github_ops['|='],
																										A2(
																											_aforemny$ncms$Ncms_Github_ops['|='],
																											A2(
																												_aforemny$ncms$Ncms_Github_ops['|='],
																												A2(
																													_aforemny$ncms$Ncms_Github_ops['|='],
																													A2(
																														_aforemny$ncms$Ncms_Github_ops['|='],
																														A2(
																															_aforemny$ncms$Ncms_Github_ops['|='],
																															_aforemny$ncms$Ncms_Github$succeed(_aforemny$ncms$Ncms_Github$User),
																															A2(
																																_elm_lang$core$Json_Decode$at,
																																{
																																	ctor: '::',
																																	_0: 'login',
																																	_1: {ctor: '[]'}
																																},
																																_elm_lang$core$Json_Decode$string)),
																														A2(
																															_elm_lang$core$Json_Decode$at,
																															{
																																ctor: '::',
																																_0: 'id',
																																_1: {ctor: '[]'}
																															},
																															_elm_lang$core$Json_Decode$int)),
																													A2(
																														_elm_lang$core$Json_Decode$at,
																														{
																															ctor: '::',
																															_0: 'avatar_url',
																															_1: {ctor: '[]'}
																														},
																														_elm_lang$core$Json_Decode$string)),
																												A2(
																													_elm_lang$core$Json_Decode$at,
																													{
																														ctor: '::',
																														_0: 'gravatar_id',
																														_1: {ctor: '[]'}
																													},
																													_elm_lang$core$Json_Decode$string)),
																											A2(
																												_elm_lang$core$Json_Decode$at,
																												{
																													ctor: '::',
																													_0: 'url',
																													_1: {ctor: '[]'}
																												},
																												_elm_lang$core$Json_Decode$string)),
																										A2(
																											_elm_lang$core$Json_Decode$at,
																											{
																												ctor: '::',
																												_0: 'html_url',
																												_1: {ctor: '[]'}
																											},
																											_elm_lang$core$Json_Decode$string)),
																									A2(
																										_elm_lang$core$Json_Decode$at,
																										{
																											ctor: '::',
																											_0: 'followers_url',
																											_1: {ctor: '[]'}
																										},
																										_elm_lang$core$Json_Decode$string)),
																								A2(
																									_elm_lang$core$Json_Decode$at,
																									{
																										ctor: '::',
																										_0: 'following_url',
																										_1: {ctor: '[]'}
																									},
																									_elm_lang$core$Json_Decode$string)),
																							A2(
																								_elm_lang$core$Json_Decode$at,
																								{
																									ctor: '::',
																									_0: 'gists_url',
																									_1: {ctor: '[]'}
																								},
																								_elm_lang$core$Json_Decode$string)),
																						A2(
																							_elm_lang$core$Json_Decode$at,
																							{
																								ctor: '::',
																								_0: 'starred_url',
																								_1: {ctor: '[]'}
																							},
																							_elm_lang$core$Json_Decode$string)),
																					A2(
																						_elm_lang$core$Json_Decode$at,
																						{
																							ctor: '::',
																							_0: 'subscriptions_url',
																							_1: {ctor: '[]'}
																						},
																						_elm_lang$core$Json_Decode$string)),
																				A2(
																					_elm_lang$core$Json_Decode$at,
																					{
																						ctor: '::',
																						_0: 'organizations_url',
																						_1: {ctor: '[]'}
																					},
																					_elm_lang$core$Json_Decode$string)),
																			A2(
																				_elm_lang$core$Json_Decode$at,
																				{
																					ctor: '::',
																					_0: 'repos_url',
																					_1: {ctor: '[]'}
																				},
																				_elm_lang$core$Json_Decode$string)),
																		A2(
																			_elm_lang$core$Json_Decode$at,
																			{
																				ctor: '::',
																				_0: 'events_url',
																				_1: {ctor: '[]'}
																			},
																			_elm_lang$core$Json_Decode$string)),
																	A2(
																		_elm_lang$core$Json_Decode$at,
																		{
																			ctor: '::',
																			_0: 'received_events_url',
																			_1: {ctor: '[]'}
																		},
																		_elm_lang$core$Json_Decode$string)),
																A2(
																	_elm_lang$core$Json_Decode$at,
																	{
																		ctor: '::',
																		_0: 'type',
																		_1: {ctor: '[]'}
																	},
																	_elm_lang$core$Json_Decode$string)),
															A2(
																_elm_lang$core$Json_Decode$at,
																{
																	ctor: '::',
																	_0: 'site_admin',
																	_1: {ctor: '[]'}
																},
																_elm_lang$core$Json_Decode$bool)),
														A2(
															_elm_lang$core$Json_Decode$at,
															{
																ctor: '::',
																_0: 'name',
																_1: {ctor: '[]'}
															},
															_elm_lang$core$Json_Decode$string)),
													A2(
														_elm_lang$core$Json_Decode$at,
														{
															ctor: '::',
															_0: 'company',
															_1: {ctor: '[]'}
														},
														_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string))),
												A2(
													_elm_lang$core$Json_Decode$at,
													{
														ctor: '::',
														_0: 'blog',
														_1: {ctor: '[]'}
													},
													_elm_lang$core$Json_Decode$string)),
											A2(
												_elm_lang$core$Json_Decode$at,
												{
													ctor: '::',
													_0: 'location',
													_1: {ctor: '[]'}
												},
												_elm_lang$core$Json_Decode$string)),
										A2(
											_elm_lang$core$Json_Decode$at,
											{
												ctor: '::',
												_0: 'email',
												_1: {ctor: '[]'}
											},
											_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string))),
									A2(
										_elm_lang$core$Json_Decode$at,
										{
											ctor: '::',
											_0: 'hireable',
											_1: {ctor: '[]'}
										},
										_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$bool))),
								A2(
									_elm_lang$core$Json_Decode$at,
									{
										ctor: '::',
										_0: 'bio',
										_1: {ctor: '[]'}
									},
									_elm_lang$core$Json_Decode$maybe(_elm_lang$core$Json_Decode$string))),
							A2(
								_elm_lang$core$Json_Decode$at,
								{
									ctor: '::',
									_0: 'public_repos',
									_1: {ctor: '[]'}
								},
								_elm_lang$core$Json_Decode$int)),
						A2(
							_elm_lang$core$Json_Decode$at,
							{
								ctor: '::',
								_0: 'public_gists',
								_1: {ctor: '[]'}
							},
							_elm_lang$core$Json_Decode$int)),
					A2(
						_elm_lang$core$Json_Decode$at,
						{
							ctor: '::',
							_0: 'followers',
							_1: {ctor: '[]'}
						},
						_elm_lang$core$Json_Decode$int)),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'following',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$int)),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'created_at',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$string)),
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'updated_at',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$string));
	return _elm_lang$http$Http$toTask(
		_elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {
					ctor: '::',
					_0: A2(
						_elm_lang$http$Http$header,
						'Authorization',
						A2(_elm_lang$core$Basics_ops['++'], 'token ', accessToken)),
					_1: {ctor: '[]'}
				},
				url: 'https://api.github.com/user',
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decode),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			}));
};
var _aforemny$ncms$Ncms_Github$Tree = F4(
	function (a, b, c, d) {
		return {sha: a, url: b, tree: c, truncated: d};
	});
var _aforemny$ncms$Ncms_Github$File = F6(
	function (a, b, c, d, e, f) {
		return {path: a, mode: b, type_: c, size: d, sha: e, url: f};
	});
var _aforemny$ncms$Ncms_Github$tree = F5(
	function (accessToken, recursive, owner, repo, sha) {
		var decodeFile = A2(
			_aforemny$ncms$Ncms_Github_ops['|='],
			A2(
				_aforemny$ncms$Ncms_Github_ops['|='],
				A2(
					_aforemny$ncms$Ncms_Github_ops['|='],
					A2(
						_aforemny$ncms$Ncms_Github_ops['|='],
						A2(
							_aforemny$ncms$Ncms_Github_ops['|='],
							A2(
								_aforemny$ncms$Ncms_Github_ops['|='],
								_aforemny$ncms$Ncms_Github$succeed(_aforemny$ncms$Ncms_Github$File),
								A2(
									_elm_lang$core$Json_Decode$at,
									{
										ctor: '::',
										_0: 'path',
										_1: {ctor: '[]'}
									},
									_elm_lang$core$Json_Decode$string)),
							A2(
								_elm_lang$core$Json_Decode$at,
								{
									ctor: '::',
									_0: 'mode',
									_1: {ctor: '[]'}
								},
								_elm_lang$core$Json_Decode$string)),
						A2(
							_elm_lang$core$Json_Decode$at,
							{
								ctor: '::',
								_0: 'type',
								_1: {ctor: '[]'}
							},
							_elm_lang$core$Json_Decode$string)),
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: A2(
								_elm_lang$core$Json_Decode$map,
								_elm_lang$core$Maybe$Just,
								A2(
									_elm_lang$core$Json_Decode$at,
									{
										ctor: '::',
										_0: 'size',
										_1: {ctor: '[]'}
									},
									_elm_lang$core$Json_Decode$int)),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Json_Decode$succeed(_elm_lang$core$Maybe$Nothing),
								_1: {ctor: '[]'}
							}
						})),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'sha',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$string)),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'url',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$string));
		var decode = A2(
			_aforemny$ncms$Ncms_Github_ops['|='],
			A2(
				_aforemny$ncms$Ncms_Github_ops['|='],
				A2(
					_aforemny$ncms$Ncms_Github_ops['|='],
					A2(
						_aforemny$ncms$Ncms_Github_ops['|='],
						_aforemny$ncms$Ncms_Github$succeed(_aforemny$ncms$Ncms_Github$Tree),
						A2(
							_elm_lang$core$Json_Decode$at,
							{
								ctor: '::',
								_0: 'sha',
								_1: {ctor: '[]'}
							},
							_elm_lang$core$Json_Decode$string)),
					A2(
						_elm_lang$core$Json_Decode$at,
						{
							ctor: '::',
							_0: 'url',
							_1: {ctor: '[]'}
						},
						_elm_lang$core$Json_Decode$string)),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'tree',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$list(decodeFile))),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'truncated',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$bool));
		return _elm_lang$http$Http$toTask(
			_elm_lang$http$Http$request(
				{
					method: 'GET',
					headers: {
						ctor: '::',
						_0: A2(
							_elm_lang$http$Http$header,
							'Authorization',
							A2(_elm_lang$core$Basics_ops['++'], 'token ', accessToken)),
						_1: {ctor: '[]'}
					},
					url: (recursive ? A2(
						_elm_lang$core$Basics$flip,
						F2(
							function (x, y) {
								return A2(_elm_lang$core$Basics_ops['++'], x, y);
							}),
						'?recursive=1') : _elm_lang$core$Basics$identity)(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'https://api.github.com/repos/',
							A2(
								_elm_lang$core$Basics_ops['++'],
								owner,
								A2(
									_elm_lang$core$Basics_ops['++'],
									'/',
									A2(
										_elm_lang$core$Basics_ops['++'],
										repo,
										A2(_elm_lang$core$Basics_ops['++'], '/git/trees/', sha)))))),
					body: _elm_lang$http$Http$emptyBody,
					expect: _elm_lang$http$Http$expectJson(decode),
					timeout: _elm_lang$core$Maybe$Nothing,
					withCredentials: false
				}));
	});
var _aforemny$ncms$Ncms_Github$Reference = F3(
	function (a, b, c) {
		return {ref: a, url: b, object: c};
	});
var _aforemny$ncms$Ncms_Github$Object = F3(
	function (a, b, c) {
		return {type_: a, sha: b, url: c};
	});
var _aforemny$ncms$Ncms_Github$reference = F4(
	function (accessToken, owner, repo, ref) {
		var decodeObject = A2(
			_aforemny$ncms$Ncms_Github_ops['|='],
			A2(
				_aforemny$ncms$Ncms_Github_ops['|='],
				A2(
					_aforemny$ncms$Ncms_Github_ops['|='],
					_aforemny$ncms$Ncms_Github$succeed(_aforemny$ncms$Ncms_Github$Object),
					A2(
						_elm_lang$core$Json_Decode$at,
						{
							ctor: '::',
							_0: 'type',
							_1: {ctor: '[]'}
						},
						_elm_lang$core$Json_Decode$string)),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'sha',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$string)),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'url',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$string));
		var decode = A2(
			_aforemny$ncms$Ncms_Github_ops['|='],
			A2(
				_aforemny$ncms$Ncms_Github_ops['|='],
				A2(
					_aforemny$ncms$Ncms_Github_ops['|='],
					_aforemny$ncms$Ncms_Github$succeed(_aforemny$ncms$Ncms_Github$Reference),
					A2(
						_elm_lang$core$Json_Decode$at,
						{
							ctor: '::',
							_0: 'ref',
							_1: {ctor: '[]'}
						},
						_elm_lang$core$Json_Decode$string)),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'url',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$string)),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'object',
					_1: {ctor: '[]'}
				},
				decodeObject));
		return _elm_lang$http$Http$toTask(
			_elm_lang$http$Http$request(
				{
					method: 'GET',
					headers: {
						ctor: '::',
						_0: A2(
							_elm_lang$http$Http$header,
							'Authorization',
							A2(_elm_lang$core$Basics_ops['++'], 'token ', accessToken)),
						_1: {ctor: '[]'}
					},
					url: A2(
						_elm_lang$core$Basics_ops['++'],
						'https://api.github.com/repos/',
						A2(
							_elm_lang$core$Basics_ops['++'],
							owner,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'/',
								A2(
									_elm_lang$core$Basics_ops['++'],
									repo,
									A2(_elm_lang$core$Basics_ops['++'], '/git/refs/', ref))))),
					body: _elm_lang$http$Http$emptyBody,
					expect: _elm_lang$http$Http$expectJson(decode),
					timeout: _elm_lang$core$Maybe$Nothing,
					withCredentials: false
				}));
	});
var _aforemny$ncms$Ncms_Github$Blob = F5(
	function (a, b, c, d, e) {
		return {content: a, encoding: b, url: c, sha: d, size: e};
	});
var _aforemny$ncms$Ncms_Github$blob = F4(
	function (accessToken, owner, repo, sha) {
		var decode = A2(
			_aforemny$ncms$Ncms_Github_ops['|='],
			A2(
				_aforemny$ncms$Ncms_Github_ops['|='],
				A2(
					_aforemny$ncms$Ncms_Github_ops['|='],
					A2(
						_aforemny$ncms$Ncms_Github_ops['|='],
						A2(
							_aforemny$ncms$Ncms_Github_ops['|='],
							_aforemny$ncms$Ncms_Github$succeed(_aforemny$ncms$Ncms_Github$Blob),
							A2(
								_elm_lang$core$Json_Decode$at,
								{
									ctor: '::',
									_0: 'content',
									_1: {ctor: '[]'}
								},
								A2(
									_elm_lang$core$Json_Decode$map,
									function (_p0) {
										return A2(
											_elm_lang$core$String$join,
											'',
											A2(_elm_lang$core$String$split, '\n', _p0));
									},
									_elm_lang$core$Json_Decode$string))),
						A2(
							_elm_lang$core$Json_Decode$at,
							{
								ctor: '::',
								_0: 'encoding',
								_1: {ctor: '[]'}
							},
							_elm_lang$core$Json_Decode$string)),
					A2(
						_elm_lang$core$Json_Decode$at,
						{
							ctor: '::',
							_0: 'url',
							_1: {ctor: '[]'}
						},
						_elm_lang$core$Json_Decode$string)),
				A2(
					_elm_lang$core$Json_Decode$at,
					{
						ctor: '::',
						_0: 'sha',
						_1: {ctor: '[]'}
					},
					_elm_lang$core$Json_Decode$string)),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'size',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$int));
		return _elm_lang$http$Http$toTask(
			_elm_lang$http$Http$request(
				{
					method: 'GET',
					headers: {
						ctor: '::',
						_0: A2(
							_elm_lang$http$Http$header,
							'Authorization',
							A2(_elm_lang$core$Basics_ops['++'], 'token ', accessToken)),
						_1: {ctor: '[]'}
					},
					url: A2(
						_elm_lang$core$Basics_ops['++'],
						'https://api.github.com/repos/',
						A2(
							_elm_lang$core$Basics_ops['++'],
							owner,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'/',
								A2(
									_elm_lang$core$Basics_ops['++'],
									repo,
									A2(_elm_lang$core$Basics_ops['++'], '/git/blobs/', sha))))),
					body: _elm_lang$http$Http$emptyBody,
					expect: _elm_lang$http$Http$expectJson(decode),
					timeout: _elm_lang$core$Maybe$Nothing,
					withCredentials: false
				}));
	});

var _aforemny$ncms$Ncms_Backend_Github$request = F5(
	function (accessToken, method, url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: method,
				headers: {
					ctor: '::',
					_0: A2(_elm_lang$http$Http$header, 'Accept', 'application/json'),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$http$Http$header,
							'Authorization',
							A2(_elm_lang$core$Basics_ops['++'], 'token ', accessToken)),
						_1: {ctor: '[]'}
					}
				},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _aforemny$ncms$Ncms_Backend_Github$create = F5(
	function (endpoint, encode, decoder, cont, obj) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A5(
				_aforemny$ncms$Ncms_Backend_Github$request,
				'',
				'POST',
				endpoint,
				_elm_lang$http$Http$jsonBody(
					encode(obj)),
				decoder));
	});
var _aforemny$ncms$Ncms_Backend_Github$list = F7(
	function (endpoint, encode, decoder, cont, accessToken, owner, repo) {
		return A2(
			_elm_lang$core$Task$attempt,
			cont,
			A2(
				_elm_lang$core$Task$andThen,
				function (_p0) {
					var _p1 = _p0;
					return A2(
						_elm_lang$core$Task$map,
						function (blobs) {
							return A2(
								_elm_lang$core$List$map,
								function (blob) {
									var _p2 = _truqu$elm_base64$Base64$decode(blob.content);
									if (_p2.ctor === 'Ok') {
										var _p3 = A2(_elm_lang$core$Json_Decode$decodeString, decoder, _p2._0);
										if (_p3.ctor === 'Ok') {
											return _p3._0;
										} else {
											return _elm_lang$core$Native_Utils.crashCase(
												'Ncms.Backend.Github',
												{
													start: {line: 55, column: 31},
													end: {line: 59, column: 62}
												},
												_p3)('no decode');
										}
									} else {
										return _elm_lang$core$Native_Utils.crashCase(
											'Ncms.Backend.Github',
											{
												start: {line: 53, column: 23},
												end: {line: 61, column: 63}
											},
											_p2)('non-base64 content');
									}
								},
								blobs);
						},
						_elm_lang$core$Task$sequence(
							A2(
								_elm_lang$core$List$map,
								function (file) {
									return A4(_aforemny$ncms$Ncms_Github$blob, accessToken, owner, repo, file.sha);
								},
								A2(
									_elm_lang$core$List$filter,
									function (file) {
										return A2(
											_elm_lang$core$Regex$contains,
											_elm_lang$core$Regex$regex(
												A2(
													_elm_lang$core$Basics_ops['++'],
													'^/',
													A2(_elm_lang$core$Basics_ops['++'], endpoint, '/.*\\.json$'))),
											file.path);
									},
									_p1.tree))));
				},
				A2(
					_elm_lang$core$Task$andThen,
					function (reference) {
						return A5(_aforemny$ncms$Ncms_Github$tree, accessToken, true, owner, repo, reference.object.sha);
					},
					A4(_aforemny$ncms$Ncms_Github$reference, accessToken, owner, repo, 'heads/gh-pages'))));
	});
var _aforemny$ncms$Ncms_Backend_Github$delete = F5(
	function (endpoint, encode, decoder, cont, id) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A5(
				_aforemny$ncms$Ncms_Backend_Github$request,
				'',
				'DELETE',
				A2(
					_elm_lang$core$Basics_ops['++'],
					endpoint,
					A2(_elm_lang$core$Basics_ops['++'], '/', id)),
				_elm_lang$http$Http$emptyBody,
				decoder));
	});
var _aforemny$ncms$Ncms_Backend_Github$update = F6(
	function (endpoint, encode, decoder, id, cont, obj) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A5(
				_aforemny$ncms$Ncms_Backend_Github$request,
				'',
				'POST',
				A2(
					_elm_lang$core$Basics_ops['++'],
					endpoint,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'/',
						id(obj))),
				_elm_lang$http$Http$jsonBody(
					encode(obj)),
				decoder));
	});
var _aforemny$ncms$Ncms_Backend_Github$get = F5(
	function (endpoint, encode, decoder, cont, id) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A5(
				_aforemny$ncms$Ncms_Backend_Github$request,
				'',
				'GET',
				A2(
					_elm_lang$core$Basics_ops['++'],
					endpoint,
					A2(_elm_lang$core$Basics_ops['++'], '/', id)),
				_elm_lang$http$Http$emptyBody,
				decoder));
	});

var _aforemny$ncms$Ncms_Backend_Ncms$request = F4(
	function (method, url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: method,
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _aforemny$ncms$Ncms_Backend_Ncms$create = F5(
	function (endpoint, encode, decoder, cont, obj) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A4(
				_aforemny$ncms$Ncms_Backend_Ncms$request,
				'POST',
				endpoint,
				_elm_lang$http$Http$jsonBody(
					encode(obj)),
				decoder));
	});
var _aforemny$ncms$Ncms_Backend_Ncms$list = F4(
	function (endpoint, encode, decoder, cont) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A4(
				_aforemny$ncms$Ncms_Backend_Ncms$request,
				'GET',
				endpoint,
				_elm_lang$http$Http$emptyBody,
				_elm_lang$core$Json_Decode$list(decoder)));
	});
var _aforemny$ncms$Ncms_Backend_Ncms$delete = F5(
	function (endpoint, encode, decoder, cont, id) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A4(
				_aforemny$ncms$Ncms_Backend_Ncms$request,
				'DELETE',
				A2(
					_elm_lang$core$Basics_ops['++'],
					endpoint,
					A2(_elm_lang$core$Basics_ops['++'], '/', id)),
				_elm_lang$http$Http$emptyBody,
				decoder));
	});
var _aforemny$ncms$Ncms_Backend_Ncms$update = F6(
	function (endpoint, encode, decoder, id, cont, obj) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A4(
				_aforemny$ncms$Ncms_Backend_Ncms$request,
				'POST',
				A2(
					_elm_lang$core$Basics_ops['++'],
					endpoint,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'/',
						id(obj))),
				_elm_lang$http$Http$jsonBody(
					encode(obj)),
				decoder));
	});
var _aforemny$ncms$Ncms_Backend_Ncms$get = F5(
	function (endpoint, encode, decoder, cont, id) {
		return A2(
			_elm_lang$http$Http$send,
			cont,
			A4(
				_aforemny$ncms$Ncms_Backend_Ncms$request,
				'GET',
				A2(
					_elm_lang$core$Basics_ops['++'],
					endpoint,
					A2(_elm_lang$core$Basics_ops['++'], '/', id)),
				_elm_lang$http$Http$emptyBody,
				decoder));
	});

var _aforemny$ncms$Api_User$encodeUser = function (value) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'username',
				_1: _elm_lang$core$Json_Encode$string(value.username)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'email',
					_1: _elm_lang$core$Json_Encode$string(value.email)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _aforemny$ncms$Api_User$defaultUser = {username: '', email: ''};
var _aforemny$ncms$Api_User$User = F2(
	function (a, b) {
		return {username: a, email: b};
	});
var _aforemny$ncms$Api_User$userDecoder = A3(
	_elm_lang$core$Json_Decode$map2,
	_aforemny$ncms$Api_User$User,
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'username',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$string),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'email',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$string));
var _aforemny$ncms$Api_User$get = A3(_aforemny$ncms$Ncms_Backend_Github$get, 'user', _aforemny$ncms$Api_User$encodeUser, _aforemny$ncms$Api_User$userDecoder);
var _aforemny$ncms$Api_User$update = A4(
	_aforemny$ncms$Ncms_Backend_Github$update,
	'user',
	_aforemny$ncms$Api_User$encodeUser,
	_aforemny$ncms$Api_User$userDecoder,
	function (_) {
		return _.username;
	});
var _aforemny$ncms$Api_User$delete = A3(_aforemny$ncms$Ncms_Backend_Github$delete, 'user', _aforemny$ncms$Api_User$encodeUser, _aforemny$ncms$Api_User$userDecoder);
var _aforemny$ncms$Api_User$list = A3(_aforemny$ncms$Ncms_Backend_Github$list, '/user', _aforemny$ncms$Api_User$encodeUser, _aforemny$ncms$Api_User$userDecoder);
var _aforemny$ncms$Api_User$create = A3(_aforemny$ncms$Ncms_Backend_Github$create, 'user', _aforemny$ncms$Api_User$encodeUser, _aforemny$ncms$Api_User$userDecoder);

var _aforemny$ncms$Api_Blog$encodeBlog = function (value) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'id',
				_1: _elm_lang$core$Json_Encode$string(value.id)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'published',
					_1: _elm_lang$core$Json_Encode$bool(value.published)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'date',
						_1: _elm_lang$core$Json_Encode$string(value.date)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'title',
							_1: _elm_lang$core$Json_Encode$string(value.title)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'content',
								_1: _elm_lang$core$Json_Encode$string(value.content)
							},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _aforemny$ncms$Api_Blog$defaultBlog = {id: '', published: false, date: '', title: '', content: ''};
var _aforemny$ncms$Api_Blog$Blog = F5(
	function (a, b, c, d, e) {
		return {id: a, published: b, date: c, title: d, content: e};
	});
var _aforemny$ncms$Api_Blog$blogDecoder = A6(
	_elm_lang$core$Json_Decode$map5,
	_aforemny$ncms$Api_Blog$Blog,
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'id',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$string),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'published',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'date',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$string),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'title',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$string),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'content',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$string));
var _aforemny$ncms$Api_Blog$get = A3(_aforemny$ncms$Ncms_Backend_Github$get, 'blog', _aforemny$ncms$Api_Blog$encodeBlog, _aforemny$ncms$Api_Blog$blogDecoder);
var _aforemny$ncms$Api_Blog$update = A4(
	_aforemny$ncms$Ncms_Backend_Github$update,
	'blog',
	_aforemny$ncms$Api_Blog$encodeBlog,
	_aforemny$ncms$Api_Blog$blogDecoder,
	function (_) {
		return _.id;
	});
var _aforemny$ncms$Api_Blog$delete = A3(_aforemny$ncms$Ncms_Backend_Github$delete, 'blog', _aforemny$ncms$Api_Blog$encodeBlog, _aforemny$ncms$Api_Blog$blogDecoder);
var _aforemny$ncms$Api_Blog$list = A3(_aforemny$ncms$Ncms_Backend_Github$list, '/blog', _aforemny$ncms$Api_Blog$encodeBlog, _aforemny$ncms$Api_Blog$blogDecoder);
var _aforemny$ncms$Api_Blog$create = A3(_aforemny$ncms$Ncms_Backend_Github$create, 'blog', _aforemny$ncms$Api_Blog$encodeBlog, _aforemny$ncms$Api_Blog$blogDecoder);

var _aforemny$ncms$Api$apis = {
	ctor: '::',
	_0: {
		type_: 'User',
		idField: 'username',
		types: {
			ctor: '::',
			_0: {
				type_: 'User',
				fields: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'username', _1: 'String'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'email', _1: 'String'},
						_1: {ctor: '[]'}
					}
				}
			},
			_1: {ctor: '[]'}
		},
		api: {
			get: A3(_aforemny$ncms$Ncms_Backend_Github$get, 'user', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
			update: A3(_aforemny$ncms$Ncms_Backend_Github$update, 'user', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
			$delete: A3(_aforemny$ncms$Ncms_Backend_Github$delete, 'user', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
			create: A3(_aforemny$ncms$Ncms_Backend_Github$create, 'user', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
			list: A3(_aforemny$ncms$Ncms_Backend_Github$list, '/user', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value)
		}
	},
	_1: {
		ctor: '::',
		_0: {
			type_: 'Blog',
			idField: 'id',
			types: {
				ctor: '::',
				_0: {
					type_: 'Blog',
					fields: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'id', _1: 'String'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'published', _1: 'Bool'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'date', _1: 'String'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'title', _1: 'String'},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'content', _1: 'String'},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				},
				_1: {ctor: '[]'}
			},
			api: {
				get: A3(_aforemny$ncms$Ncms_Backend_Github$get, 'blog', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
				update: A3(_aforemny$ncms$Ncms_Backend_Github$update, 'blog', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
				$delete: A3(_aforemny$ncms$Ncms_Backend_Github$delete, 'blog', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
				create: A3(_aforemny$ncms$Ncms_Backend_Github$create, 'blog', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value),
				list: A3(_aforemny$ncms$Ncms_Backend_Github$list, '/blog', _elm_lang$core$Basics$identity, _elm_lang$core$Json_Decode$value)
			}
		},
		_1: {ctor: '[]'}
	}
};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _aforemny$ncms$Material_Helpers$noAttr = A2(_elm_lang$html$Html_Attributes$attribute, 'data-elm-mdc-noop', '');
var _aforemny$ncms$Material_Helpers$aria = F2(
	function (name, value) {
		return value ? A2(
			_elm_lang$html$Html_Attributes$attribute,
			A2(_elm_lang$core$Basics_ops['++'], 'aria-', name),
			'true') : _aforemny$ncms$Material_Helpers$noAttr;
	});
var _aforemny$ncms$Material_Helpers$delay = F2(
	function (t, x) {
		return A2(
			_elm_lang$core$Task$perform,
			_elm_lang$core$Basics$always(x),
			_elm_lang$core$Process$sleep(t));
	});
var _aforemny$ncms$Material_Helpers$cssTransitionStep = function (x) {
	return A2(_aforemny$ncms$Material_Helpers$delay, 50, x);
};
var _aforemny$ncms$Material_Helpers$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$always(msg),
		_elm_lang$core$Task$succeed(msg));
};
var _aforemny$ncms$Material_Helpers$map2nd = F2(
	function (f, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: f(_p1._1)
		};
	});
var _aforemny$ncms$Material_Helpers$map1st = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: f(_p3._0),
			_1: _p3._1
		};
	});
var _aforemny$ncms$Material_Helpers$blurOn = function (evt) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', evt),
		'this.blur()');
};
var _aforemny$ncms$Material_Helpers$effect = F2(
	function (e, x) {
		return {ctor: '_Tuple2', _0: x, _1: e};
	});
var _aforemny$ncms$Material_Helpers$pure = _aforemny$ncms$Material_Helpers$effect(_elm_lang$core$Platform_Cmd$none);
var _aforemny$ncms$Material_Helpers$filter = F3(
	function (elem, attr, html) {
		return A2(
			elem,
			attr,
			A2(
				_elm_lang$core$List$filterMap,
				function (x) {
					return x;
				},
				html));
	});

var _aforemny$ncms$Material_Internal_Button$NoOp = {ctor: 'NoOp'};

var _aforemny$ncms$Material_Internal_Drawer$defaultGeometry = {width: 0};
var _aforemny$ncms$Material_Internal_Drawer$Geometry = function (a) {
	return {width: a};
};
var _aforemny$ncms$Material_Internal_Drawer$Toggle = function (a) {
	return {ctor: 'Toggle', _0: a};
};
var _aforemny$ncms$Material_Internal_Drawer$Close = {ctor: 'Close'};
var _aforemny$ncms$Material_Internal_Drawer$Open = function (a) {
	return {ctor: 'Open', _0: a};
};
var _aforemny$ncms$Material_Internal_Drawer$Click = {ctor: 'Click'};
var _aforemny$ncms$Material_Internal_Drawer$Tick = {ctor: 'Tick'};
var _aforemny$ncms$Material_Internal_Drawer$NoOp = {ctor: 'NoOp'};

var _aforemny$ncms$Material_Internal_Radio$NoOp = {ctor: 'NoOp'};
var _aforemny$ncms$Material_Internal_Radio$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};

var _aforemny$ncms$Material_Internal_IconToggle$NoOp = {ctor: 'NoOp'};

var _aforemny$ncms$Material_Internal_Fab$NoOp = {ctor: 'NoOp'};

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$mouse$Mouse_ops = _elm_lang$mouse$Mouse_ops || {};
_elm_lang$mouse$Mouse_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return t2;
			},
			t1);
	});
var _elm_lang$mouse$Mouse$onSelfMsg = F3(
	function (router, _p1, state) {
		var _p2 = _p1;
		var _p3 = A2(_elm_lang$core$Dict$get, _p2.category, state);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p2.position));
			};
			return A2(
				_elm_lang$mouse$Mouse_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p3._0.taggers)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$mouse$Mouse$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$mouse$Mouse$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p4 = maybeValues;
		if (_p4.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p4._0});
		}
	});
var _elm_lang$mouse$Mouse$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p5 = subs;
			if (_p5.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p5._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p5._0._0,
					_elm_lang$mouse$Mouse$categorizeHelpHelp(_p5._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$mouse$Mouse$categorize = function (subs) {
	return A2(_elm_lang$mouse$Mouse$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$mouse$Mouse$subscription = _elm_lang$core$Native_Platform.leaf('Mouse');
var _elm_lang$mouse$Mouse$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _elm_lang$mouse$Mouse$position = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$mouse$Mouse$Position,
	A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$int));
var _elm_lang$mouse$Mouse$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$mouse$Mouse$Msg = F2(
	function (a, b) {
		return {category: a, position: b};
	});
var _elm_lang$mouse$Mouse$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				var tracker = A3(
					_elm_lang$dom$Dom_LowLevel$onDocument,
					category,
					_elm_lang$mouse$Mouse$position,
					function (_p6) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$mouse$Mouse$Msg, category, _p6));
					});
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$mouse$Mouse$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(tracker));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p7, taggers, task) {
				var _p8 = _p7;
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$core$Dict$insert,
								category,
								A2(_elm_lang$mouse$Mouse$Watcher, taggers, _p8.pid),
								state));
					},
					task);
			});
		var leftStep = F3(
			function (category, _p9, task) {
				var _p10 = _p9;
				return A2(
					_elm_lang$mouse$Mouse_ops['&>'],
					_elm_lang$core$Process$kill(_p10.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$mouse$Mouse$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$mouse$Mouse$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$mouse$Mouse$clicks = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'click', tagger));
};
var _elm_lang$mouse$Mouse$moves = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousemove', tagger));
};
var _elm_lang$mouse$Mouse$downs = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousedown', tagger));
};
var _elm_lang$mouse$Mouse$ups = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mouseup', tagger));
};
var _elm_lang$mouse$Mouse$subMap = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return A2(
			_elm_lang$mouse$Mouse$MySub,
			_p12._0,
			function (_p13) {
				return func(
					_p12._1(_p13));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Mouse'] = {pkg: 'elm-lang/mouse', init: _elm_lang$mouse$Mouse$init, onEffects: _elm_lang$mouse$Mouse$onEffects, onSelfMsg: _elm_lang$mouse$Mouse$onSelfMsg, tag: 'sub', subMap: _elm_lang$mouse$Mouse$subMap};

var _aforemny$ncms$Material_Internal_Menu$defaultGeometry = {
	itemsContainer: {width: 0, height: 0},
	itemGeometries: {ctor: '[]'},
	adapter: {isRtl: false},
	anchor: {top: 0, left: 0, bottom: 0, right: 0},
	window: {width: 800, height: 600}
};
var _aforemny$ncms$Material_Internal_Menu$defaultMeta = {altKey: false, ctrlKey: false, metaKey: false, shiftKey: false};
var _aforemny$ncms$Material_Internal_Menu$Meta = F4(
	function (a, b, c, d) {
		return {altKey: a, ctrlKey: b, metaKey: c, shiftKey: d};
	});
var _aforemny$ncms$Material_Internal_Menu$Geometry = F5(
	function (a, b, c, d, e) {
		return {itemsContainer: a, itemGeometries: b, adapter: c, anchor: d, window: e};
	});
var _aforemny$ncms$Material_Internal_Menu$KeyUp = F3(
	function (a, b, c) {
		return {ctor: 'KeyUp', _0: a, _1: b, _2: c};
	});
var _aforemny$ncms$Material_Internal_Menu$KeyDown = F3(
	function (a, b, c) {
		return {ctor: 'KeyDown', _0: a, _1: b, _2: c};
	});
var _aforemny$ncms$Material_Internal_Menu$Click = function (a) {
	return {ctor: 'Click', _0: a};
};
var _aforemny$ncms$Material_Internal_Menu$Tick = function (a) {
	return {ctor: 'Tick', _0: a};
};
var _aforemny$ncms$Material_Internal_Menu$Close = function (a) {
	return {ctor: 'Close', _0: a};
};
var _aforemny$ncms$Material_Internal_Menu$Open = function (a) {
	return {ctor: 'Open', _0: a};
};
var _aforemny$ncms$Material_Internal_Menu$Toggle = function (a) {
	return {ctor: 'Toggle', _0: a};
};

var _debois$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _debois$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _debois$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _debois$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _debois$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _debois$elm_dom$DOM$nextSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'nextSibling', decoder);
};
var _debois$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_debois$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_debois$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_debois$elm_dom$DOM$scrollLeft,
				_debois$elm_dom$DOM$scrollTop,
				_debois$elm_dom$DOM$offsetLeft,
				_debois$elm_dom$DOM$offsetTop));
	});
var _debois$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_debois$elm_dom$DOM$position, 0, 0),
	_debois$elm_dom$DOM$offsetWidth,
	_debois$elm_dom$DOM$offsetHeight);
var _debois$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _debois$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

var _aforemny$ncms$Material_Internal_Ripple$defaultGeometry = {
	isSurfaceDisabled: false,
	event: {type_: '', pageX: 0, pageY: 0},
	frame: {width: 0, height: 0, left: 0, top: 0}
};
var _aforemny$ncms$Material_Internal_Ripple$Geometry = F3(
	function (a, b, c) {
		return {isSurfaceDisabled: a, event: b, frame: c};
	});
var _aforemny$ncms$Material_Internal_Ripple$Deactivate = {ctor: 'Deactivate'};
var _aforemny$ncms$Material_Internal_Ripple$Activate = function (a) {
	return {ctor: 'Activate', _0: a};
};
var _aforemny$ncms$Material_Internal_Ripple$Blur = {ctor: 'Blur'};
var _aforemny$ncms$Material_Internal_Ripple$Focus = function (a) {
	return {ctor: 'Focus', _0: a};
};

var _aforemny$ncms$Material_Internal_Select$MenuMsg = function (a) {
	return {ctor: 'MenuMsg', _0: a};
};

var _aforemny$ncms$Material_Internal_Snackbar$Dismiss = F2(
	function (a, b) {
		return {ctor: 'Dismiss', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Internal_Snackbar$Move = F2(
	function (a, b) {
		return {ctor: 'Move', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Internal_Snackbar$Clicked = {ctor: 'Clicked'};
var _aforemny$ncms$Material_Internal_Snackbar$Timeout = {ctor: 'Timeout'};

var _aforemny$ncms$Material_Internal_Tabs$defaultGeometry = {
	tabs: {ctor: '[]'},
	scrollFrame: {width: 0}
};
var _aforemny$ncms$Material_Internal_Tabs$Geometry = F2(
	function (a, b) {
		return {tabs: a, scrollFrame: b};
	});
var _aforemny$ncms$Material_Internal_Tabs$Init = function (a) {
	return {ctor: 'Init', _0: a};
};
var _aforemny$ncms$Material_Internal_Tabs$ScrollBackward = function (a) {
	return {ctor: 'ScrollBackward', _0: a};
};
var _aforemny$ncms$Material_Internal_Tabs$ScrollForward = function (a) {
	return {ctor: 'ScrollForward', _0: a};
};
var _aforemny$ncms$Material_Internal_Tabs$Dispatch = function (a) {
	return {ctor: 'Dispatch', _0: a};
};
var _aforemny$ncms$Material_Internal_Tabs$Select = F2(
	function (a, b) {
		return {ctor: 'Select', _0: a, _1: b};
	});

var _aforemny$ncms$Material_Internal_Textfield$NoOp = {ctor: 'NoOp'};
var _aforemny$ncms$Material_Internal_Textfield$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _aforemny$ncms$Material_Internal_Textfield$Focus = {ctor: 'Focus'};
var _aforemny$ncms$Material_Internal_Textfield$Blur = {ctor: 'Blur'};

var _aforemny$ncms$Material_Internal_Checkbox$NoOp = {ctor: 'NoOp'};
var _aforemny$ncms$Material_Internal_Checkbox$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};

var _aforemny$ncms$Material_Internal_Switch$NoOp = {ctor: 'NoOp'};
var _aforemny$ncms$Material_Internal_Switch$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};

var _aforemny$ncms$Material_Internal_Slider$defaultGeometry = {width: 0, left: 0, x: 0, discrete: false, min: 0, max: 100, steps: 1};
var _aforemny$ncms$Material_Internal_Slider$Geometry = F7(
	function (a, b, c, d, e, f, g) {
		return {width: a, left: b, x: c, discrete: d, steps: e, min: f, max: g};
	});
var _aforemny$ncms$Material_Internal_Slider$Dispatch = function (a) {
	return {ctor: 'Dispatch', _0: a};
};
var _aforemny$ncms$Material_Internal_Slider$Tick = {ctor: 'Tick'};
var _aforemny$ncms$Material_Internal_Slider$Up = {ctor: 'Up'};
var _aforemny$ncms$Material_Internal_Slider$Drag = function (a) {
	return {ctor: 'Drag', _0: a};
};
var _aforemny$ncms$Material_Internal_Slider$Activate = F2(
	function (a, b) {
		return {ctor: 'Activate', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Internal_Slider$Blur = {ctor: 'Blur'};
var _aforemny$ncms$Material_Internal_Slider$Focus = {ctor: 'Focus'};
var _aforemny$ncms$Material_Internal_Slider$NoOp = {ctor: 'NoOp'};

var _aforemny$ncms$Material_Msg$TextfieldMsg = F2(
	function (a, b) {
		return {ctor: 'TextfieldMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$TabsMsg = F2(
	function (a, b) {
		return {ctor: 'TabsMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$SwitchMsg = F2(
	function (a, b) {
		return {ctor: 'SwitchMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$SnackbarMsg = F2(
	function (a, b) {
		return {ctor: 'SnackbarMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$SliderMsg = F2(
	function (a, b) {
		return {ctor: 'SliderMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$SelectMsg = F2(
	function (a, b) {
		return {ctor: 'SelectMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$RippleMsg = F2(
	function (a, b) {
		return {ctor: 'RippleMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$RadioMsg = F2(
	function (a, b) {
		return {ctor: 'RadioMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$MenuMsg = F2(
	function (a, b) {
		return {ctor: 'MenuMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$IconToggleMsg = F2(
	function (a, b) {
		return {ctor: 'IconToggleMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$FabMsg = F2(
	function (a, b) {
		return {ctor: 'FabMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$DrawerMsg = F2(
	function (a, b) {
		return {ctor: 'DrawerMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$Dispatch = function (a) {
	return {ctor: 'Dispatch', _0: a};
};
var _aforemny$ncms$Material_Msg$CheckboxMsg = F2(
	function (a, b) {
		return {ctor: 'CheckboxMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Material_Msg$ButtonMsg = F2(
	function (a, b) {
		return {ctor: 'ButtonMsg', _0: a, _1: b};
	});

var _aforemny$ncms$Material_Component$subs = F5(
	function (ctor, get, subscriptions, lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			A3(
				_elm_lang$core$Dict$foldl,
				F3(
					function (idx, model, ss) {
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Platform_Sub$map,
								function (_p0) {
									return lift(
										A2(ctor, idx, _p0));
								},
								subscriptions(model)),
							_1: ss
						};
					}),
				{ctor: '[]'},
				get(model)));
	});
var _aforemny$ncms$Material_Component$generalise = F4(
	function (update, lift, msg, model) {
		return A2(
			_aforemny$ncms$Material_Helpers$map2nd,
			_elm_lang$core$Platform_Cmd$map(lift),
			A2(
				_aforemny$ncms$Material_Helpers$map1st,
				_elm_lang$core$Maybe$Just,
				A2(update, msg, model)));
	});
var _aforemny$ncms$Material_Component$react = F8(
	function (get, set, ctor, update, lift, msg, idx, store) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			_elm_lang$core$Maybe$map(
				A2(set, idx, store)),
			A3(
				update,
				function (_p1) {
					return lift(
						A2(ctor, idx, _p1));
				},
				msg,
				A2(get, idx, store)));
	});
var _aforemny$ncms$Material_Component$react1 = F7(
	function (get, set, ctor, update, lift, msg, store) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			_elm_lang$core$Maybe$map(
				set(store)),
			A3(
				update,
				function (_p2) {
					return lift(
						ctor(_p2));
				},
				msg,
				get(store)));
	});
var _aforemny$ncms$Material_Component$render = F6(
	function (get_model, view, ctor, lift, idx, store) {
		return A2(
			view,
			function (_p3) {
				return lift(
					A2(ctor, idx, _p3));
			},
			A2(get_model, idx, store));
	});
var _aforemny$ncms$Material_Component$render1 = F5(
	function (get_model, view, ctor, lift, store) {
		return A2(
			view,
			function (_p4) {
				return lift(
					ctor(_p4));
			},
			get_model(store));
	});
var _aforemny$ncms$Material_Component$indexed = F3(
	function (get_model, set_model, model0) {
		var set_ = F3(
			function (idx, store, model) {
				return A2(
					set_model,
					A3(
						_elm_lang$core$Dict$insert,
						idx,
						model,
						get_model(store)),
					store);
			});
		var get_ = F2(
			function (idx, store) {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					model0,
					A2(
						_elm_lang$core$Dict$get,
						idx,
						get_model(store)));
			});
		return {ctor: '_Tuple2', _0: get_, _1: set_};
	});

var _aforemny$ncms$Material_Internal_Dispatch$Config = function (a) {
	return {ctor: 'Config', _0: a};
};

var _aforemny$ncms$Material_Dispatch$split = F4(
	function (k0, same, differ, xs) {
		split:
		while (true) {
			var _p0 = xs;
			if (_p0.ctor === '[]') {
				return {ctor: '_Tuple2', _0: same, _1: differ};
			} else {
				var _p1 = _p0._1;
				if (_elm_lang$core$Native_Utils.eq(_p0._0._0, k0)) {
					var _v1 = k0,
						_v2 = {ctor: '::', _0: _p0._0._1, _1: same},
						_v3 = differ,
						_v4 = _p1;
					k0 = _v1;
					same = _v2;
					differ = _v3;
					xs = _v4;
					continue split;
				} else {
					var _v5 = k0,
						_v6 = same,
						_v7 = {ctor: '::', _0: _p0._0, _1: differ},
						_v8 = _p1;
					k0 = _v5;
					same = _v6;
					differ = _v7;
					xs = _v8;
					continue split;
				}
			}
		}
	});
var _aforemny$ncms$Material_Dispatch$group_ = F2(
	function (acc, items) {
		group_:
		while (true) {
			var _p2 = items;
			if (_p2.ctor === '[]') {
				return acc;
			} else {
				if (_p2._1.ctor === '[]') {
					return {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _p2._0._0,
							_1: {
								ctor: '::',
								_0: _p2._0._1,
								_1: {ctor: '[]'}
							}
						},
						_1: acc
					};
				} else {
					if ((_p2._1._0.ctor === '_Tuple2') && (_p2._1._1.ctor === '[]')) {
						var _p6 = _p2._1._0._1;
						var _p5 = _p2._0._1;
						var _p4 = _p2._1._0._0;
						var _p3 = _p2._0._0;
						return _elm_lang$core$Native_Utils.eq(_p3, _p4) ? {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p3,
								_1: {
									ctor: '::',
									_0: _p6,
									_1: {
										ctor: '::',
										_0: _p5,
										_1: {ctor: '[]'}
									}
								}
							},
							_1: acc
						} : {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _p4,
								_1: {
									ctor: '::',
									_0: _p6,
									_1: {ctor: '[]'}
								}
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p3,
									_1: {
										ctor: '::',
										_0: _p5,
										_1: {ctor: '[]'}
									}
								},
								_1: acc
							}
						};
					} else {
						var _p8 = _p2._0._0;
						var _p7 = A4(
							_aforemny$ncms$Material_Dispatch$split,
							_p8,
							{
								ctor: '::',
								_0: _p2._0._1,
								_1: {ctor: '[]'}
							},
							{ctor: '[]'},
							_p2._1);
						var same = _p7._0;
						var different = _p7._1;
						var _v10 = {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _p8, _1: same},
							_1: acc
						},
							_v11 = different;
						acc = _v10;
						items = _v11;
						continue group_;
					}
				}
			}
		}
	});
var _aforemny$ncms$Material_Dispatch$group = _aforemny$ncms$Material_Dispatch$group_(
	{ctor: '[]'});
var _aforemny$ncms$Material_Dispatch$onSingle = function (_p9) {
	var _p10 = _p9;
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		_p10._0,
		A2(_elm_lang$core$Maybe$withDefault, _elm_lang$html$Html_Events$defaultOptions, _p10._1._1),
		_p10._1._0);
};
var _aforemny$ncms$Material_Dispatch$pickOptions = function (decoders) {
	pickOptions:
	while (true) {
		var _p11 = decoders;
		if (_p11.ctor === '::') {
			if ((_p11._0.ctor === '_Tuple2') && (_p11._0._1.ctor === 'Just')) {
				return _p11._0._1._0;
			} else {
				var _v14 = _p11._1;
				decoders = _v14;
				continue pickOptions;
			}
		} else {
			return _elm_lang$html$Html_Events$defaultOptions;
		}
	}
};
var _aforemny$ncms$Material_Dispatch$flatten = function (decoders) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		function (value) {
			return A2(
				_elm_lang$core$List$filterMap,
				function (decoder) {
					return _elm_lang$core$Result$toMaybe(
						A2(_elm_lang$core$Json_Decode$decodeValue, decoder, value));
				},
				decoders);
		},
		_elm_lang$core$Json_Decode$value);
};
var _aforemny$ncms$Material_Dispatch$onWithOptions = F4(
	function (event, lift, options, decoders) {
		return A3(
			_elm_lang$html$Html_Events$onWithOptions,
			event,
			options,
			A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				_aforemny$ncms$Material_Dispatch$flatten(decoders)));
	});
var _aforemny$ncms$Material_Dispatch$on = F2(
	function (event, lift) {
		return A3(_aforemny$ncms$Material_Dispatch$onWithOptions, event, lift, _elm_lang$html$Html_Events$defaultOptions);
	});
var _aforemny$ncms$Material_Dispatch$onMany = F2(
	function (lift, decoders) {
		var _p12 = decoders;
		if ((_p12._1.ctor === '::') && (_p12._1._1.ctor === '[]')) {
			return _aforemny$ncms$Material_Dispatch$onSingle(
				{ctor: '_Tuple2', _0: _p12._0, _1: _p12._1._0});
		} else {
			var _p13 = _p12._1;
			return A3(
				_elm_lang$html$Html_Events$onWithOptions,
				_p12._0,
				_aforemny$ncms$Material_Dispatch$pickOptions(_p13),
				lift(
					_aforemny$ncms$Material_Dispatch$flatten(
						A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, _p13))));
		}
	});
var _aforemny$ncms$Material_Dispatch$map2nd = F2(
	function (f, _p14) {
		var _p15 = _p14;
		return {
			ctor: '_Tuple2',
			_0: _p15._0,
			_1: f(_p15._1)
		};
	});
var _aforemny$ncms$Material_Dispatch$update1 = F3(
	function (update, cmd, _p16) {
		var _p17 = _p16;
		return A2(
			_aforemny$ncms$Material_Dispatch$map2nd,
			A2(
				_elm_lang$core$Basics$flip,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				_p17._1),
			A2(update, cmd, _p17._0));
	});
var _aforemny$ncms$Material_Dispatch$update = F3(
	function (update, msg, model) {
		return A2(
			_aforemny$ncms$Material_Dispatch$map2nd,
			_elm_lang$core$Platform_Cmd$batch,
			A3(
				_elm_lang$core$List$foldl,
				_aforemny$ncms$Material_Dispatch$update1(update),
				{
					ctor: '_Tuple2',
					_0: model,
					_1: {ctor: '[]'}
				},
				msg));
	});
var _aforemny$ncms$Material_Dispatch$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$always(msg),
		_elm_lang$core$Task$succeed(msg));
};
var _aforemny$ncms$Material_Dispatch$forward = function (messages) {
	return _elm_lang$core$Platform_Cmd$batch(
		A2(_elm_lang$core$List$map, _aforemny$ncms$Material_Dispatch$cmd, messages));
};
var _aforemny$ncms$Material_Dispatch$toAttributes = function (_p18) {
	var _p19 = _p18;
	var _p21 = _p19._0;
	var _p20 = _p21.lift;
	if (_p20.ctor === 'Just') {
		return A2(
			_elm_lang$core$List$map,
			_aforemny$ncms$Material_Dispatch$onMany(_p20._0),
			_aforemny$ncms$Material_Dispatch$group(_p21.decoders));
	} else {
		return A2(_elm_lang$core$List$map, _aforemny$ncms$Material_Dispatch$onSingle, _p21.decoders);
	}
};
var _aforemny$ncms$Material_Dispatch$clear = function (_p22) {
	var _p23 = _p22;
	return _aforemny$ncms$Material_Internal_Dispatch$Config(
		_elm_lang$core$Native_Utils.update(
			_p23._0,
			{
				decoders: {ctor: '[]'}
			}));
};
var _aforemny$ncms$Material_Dispatch$add = F4(
	function (event, options, decoder, _p24) {
		var _p25 = _p24;
		var _p26 = _p25._0;
		return _aforemny$ncms$Material_Internal_Dispatch$Config(
			_elm_lang$core$Native_Utils.update(
				_p26,
				{
					decoders: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: event,
							_1: {ctor: '_Tuple2', _0: decoder, _1: options}
						},
						_1: _p26.decoders
					}
				}));
	});
var _aforemny$ncms$Material_Dispatch$getDecoder = function (_p27) {
	var _p28 = _p27;
	return _p28._0.lift;
};
var _aforemny$ncms$Material_Dispatch$setDecoder = F2(
	function (f, _p29) {
		var _p30 = _p29;
		return _aforemny$ncms$Material_Internal_Dispatch$Config(
			_elm_lang$core$Native_Utils.update(
				_p30._0,
				{
					lift: _elm_lang$core$Maybe$Just(f)
				}));
	});
var _aforemny$ncms$Material_Dispatch$setMsg = function (_p31) {
	return _aforemny$ncms$Material_Dispatch$setDecoder(
		_elm_lang$core$Json_Decode$map(_p31));
};
var _aforemny$ncms$Material_Dispatch$defaultConfig = _aforemny$ncms$Material_Internal_Dispatch$Config(
	{
		decoders: {ctor: '[]'},
		lift: _elm_lang$core$Maybe$Nothing
	});

var _aforemny$ncms$Material_Internal_Options$cssVariables = function (summary) {
	var styleNodeBlock = A2(
		_elm_lang$core$String$join,
		'\n',
		A2(
			_elm_lang$core$List$map,
			function (_p0) {
				var _p1 = _p0;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_p1._0,
					A2(
						_elm_lang$core$Basics_ops['++'],
						': ',
						A2(_elm_lang$core$Basics_ops['++'], _p1._1, ';')));
			},
			summary.vars));
	var hash = function (str) {
		return A2(
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Basics_ops['++'], x, y);
				}),
			'elm-mdc-ripple-style--',
			_elm_lang$core$String$fromList(
				A2(
					_elm_lang$core$List$filter,
					_elm_lang$core$Char$isDigit,
					_elm_lang$core$String$toList(str))));
	};
	var $class = hash(styleNodeBlock);
	var styleNodeText = A2(
		_elm_lang$core$Basics_ops['++'],
		'.',
		A2(
			_elm_lang$core$Basics_ops['++'],
			$class,
			A2(
				_elm_lang$core$Basics_ops['++'],
				' {',
				A2(_elm_lang$core$Basics_ops['++'], styleNodeBlock, ' }'))));
	var styleNode = A3(
		_elm_lang$html$Html$node,
		'style',
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$type_('text/css'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(styleNodeText),
			_1: {ctor: '[]'}
		});
	return {ctor: '_Tuple2', _0: $class, _1: styleNode};
};
var _aforemny$ncms$Material_Internal_Options$addAttributes = F2(
	function (summary, attrs) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			summary.attrs,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(summary.css),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$String$join, ' ', summary.classes)),
						_1: {ctor: '[]'}
					}
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					attrs,
					A2(
						_elm_lang$core$Basics_ops['++'],
						summary.internal,
						_aforemny$ncms$Material_Dispatch$toAttributes(summary.dispatch)))));
	});
var _aforemny$ncms$Material_Internal_Options$collect1_ = F2(
	function (options, acc) {
		var _p2 = options;
		switch (_p2.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p2._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p2._0, _1: acc.css}
					});
			case 'Var':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						vars: {ctor: '::', _0: _p2._0, _1: acc.vars}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p2._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						internal: {ctor: '::', _0: _p2._0, _1: acc.internal}
					});
			case 'Listener':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A4(_aforemny$ncms$Material_Dispatch$add, _p2._0, _p2._1, _p2._2, acc.dispatch)
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _aforemny$ncms$Material_Internal_Options$collect1_, acc, _p2._0);
			case 'Lift':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A2(_aforemny$ncms$Material_Dispatch$setDecoder, _p2._0, acc.dispatch)
					});
			case 'Set':
				return acc;
			default:
				return acc;
		}
	});
var _aforemny$ncms$Material_Internal_Options$collect1 = F2(
	function (option, acc) {
		var _p3 = option;
		switch (_p3.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p3._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p3._0, _1: acc.css}
					});
			case 'Var':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						vars: {ctor: '::', _0: _p3._0, _1: acc.vars}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p3._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						internal: {ctor: '::', _0: _p3._0, _1: acc.internal}
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _aforemny$ncms$Material_Internal_Options$collect1, acc, _p3._0);
			case 'Set':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						config: _p3._0(acc.config)
					});
			case 'Listener':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A4(_aforemny$ncms$Material_Dispatch$add, _p3._0, _p3._1, _p3._2, acc.dispatch)
					});
			case 'Lift':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						dispatch: A2(_aforemny$ncms$Material_Dispatch$setDecoder, _p3._0, acc.dispatch)
					});
			default:
				return acc;
		}
	});
var _aforemny$ncms$Material_Internal_Options$recollect = _elm_lang$core$List$foldl(_aforemny$ncms$Material_Internal_Options$collect1);
var _aforemny$ncms$Material_Internal_Options$apply = F4(
	function (summary, ctor, options, attrs) {
		return ctor(
			A2(
				_aforemny$ncms$Material_Internal_Options$addAttributes,
				A2(_aforemny$ncms$Material_Internal_Options$recollect, summary, options),
				attrs));
	});
var _aforemny$ncms$Material_Internal_Options$Summary = F7(
	function (a, b, c, d, e, f, g) {
		return {classes: a, css: b, vars: c, attrs: d, internal: e, dispatch: f, config: g};
	});
var _aforemny$ncms$Material_Internal_Options$collect = function (_p4) {
	return _aforemny$ncms$Material_Internal_Options$recollect(
		A7(
			_aforemny$ncms$Material_Internal_Options$Summary,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			_aforemny$ncms$Material_Dispatch$defaultConfig,
			_p4));
};
var _aforemny$ncms$Material_Internal_Options$collect_ = A2(
	_elm_lang$core$List$foldl,
	_aforemny$ncms$Material_Internal_Options$collect1_,
	A7(
		_aforemny$ncms$Material_Internal_Options$Summary,
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		_aforemny$ncms$Material_Dispatch$defaultConfig,
		{ctor: '_Tuple0'}));
var _aforemny$ncms$Material_Internal_Options$None = {ctor: 'None'};
var _aforemny$ncms$Material_Internal_Options$Lift = function (a) {
	return {ctor: 'Lift', _0: a};
};
var _aforemny$ncms$Material_Internal_Options$dispatch = function (lift) {
	return _aforemny$ncms$Material_Internal_Options$Lift(
		function (_p5) {
			return A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				A2(_elm_lang$core$Json_Decode$map, _aforemny$ncms$Material_Msg$Dispatch, _p5));
		});
};
var _aforemny$ncms$Material_Internal_Options$inject = F5(
	function (view, lift, a, b, c) {
		return A3(
			view,
			a,
			b,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$dispatch(lift),
				_1: c
			});
	});
var _aforemny$ncms$Material_Internal_Options$Listener = F3(
	function (a, b, c) {
		return {ctor: 'Listener', _0: a, _1: b, _2: c};
	});
var _aforemny$ncms$Material_Internal_Options$on1 = F3(
	function (event, lift, m) {
		return A3(
			_aforemny$ncms$Material_Internal_Options$Listener,
			event,
			_elm_lang$core$Maybe$Nothing,
			A2(
				_elm_lang$core$Json_Decode$map,
				lift,
				_elm_lang$core$Json_Decode$succeed(m)));
	});
var _aforemny$ncms$Material_Internal_Options$Set = function (a) {
	return {ctor: 'Set', _0: a};
};
var _aforemny$ncms$Material_Internal_Options$option = _aforemny$ncms$Material_Internal_Options$Set;
var _aforemny$ncms$Material_Internal_Options$Many = function (a) {
	return {ctor: 'Many', _0: a};
};
var _aforemny$ncms$Material_Internal_Options$applyContainer = F3(
	function (summary, ctor, options) {
		return A4(
			_aforemny$ncms$Material_Internal_Options$apply,
			_elm_lang$core$Native_Utils.update(
				summary,
				{
					dispatch: _aforemny$ncms$Material_Dispatch$clear(summary.dispatch),
					attrs: {ctor: '[]'},
					internal: {ctor: '[]'},
					config: {ctor: '_Tuple0'}
				}),
			ctor,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$Many(summary.config.container),
				_1: options
			},
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_Internal_Options$applyInput = F3(
	function (summary, ctor, options) {
		return A4(
			_aforemny$ncms$Material_Internal_Options$apply,
			_elm_lang$core$Native_Utils.update(
				summary,
				{
					classes: {ctor: '[]'},
					css: {ctor: '[]'},
					config: {ctor: '_Tuple0'}
				}),
			ctor,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$Many(summary.config.input),
				_1: options
			},
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_Internal_Options$input = function (_p6) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (style, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						input: {
							ctor: '::',
							_0: _aforemny$ncms$Material_Internal_Options$Many(style),
							_1: config.input
						}
					});
			})(_p6));
};
var _aforemny$ncms$Material_Internal_Options$container = function (_p7) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (style, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						container: {
							ctor: '::',
							_0: _aforemny$ncms$Material_Internal_Options$Many(style),
							_1: config.container
						}
					});
			})(_p7));
};
var _aforemny$ncms$Material_Internal_Options$Internal = function (a) {
	return {ctor: 'Internal', _0: a};
};
var _aforemny$ncms$Material_Internal_Options$attribute = _aforemny$ncms$Material_Internal_Options$Internal;
var _aforemny$ncms$Material_Internal_Options$Attribute = function (a) {
	return {ctor: 'Attribute', _0: a};
};
var _aforemny$ncms$Material_Internal_Options$Var = function (a) {
	return {ctor: 'Var', _0: a};
};
var _aforemny$ncms$Material_Internal_Options$variable = F2(
	function (k, v) {
		return _aforemny$ncms$Material_Internal_Options$Var(
			{ctor: '_Tuple2', _0: k, _1: v});
	});
var _aforemny$ncms$Material_Internal_Options$CSS = function (a) {
	return {ctor: 'CSS', _0: a};
};
var _aforemny$ncms$Material_Internal_Options$Class = function (a) {
	return {ctor: 'Class', _0: a};
};

var _aforemny$ncms$Material_Options$dispatch = function (_p0) {
	return _aforemny$ncms$Material_Internal_Options$Lift(
		_elm_lang$core$Json_Decode$map(_p0));
};
var _aforemny$ncms$Material_Options$onWithOptions = F2(
	function (evt, options) {
		return A2(
			_aforemny$ncms$Material_Internal_Options$Listener,
			evt,
			_elm_lang$core$Maybe$Just(options));
	});
var _aforemny$ncms$Material_Options$on = function (event) {
	return A2(_aforemny$ncms$Material_Internal_Options$Listener, event, _elm_lang$core$Maybe$Nothing);
};
var _aforemny$ncms$Material_Options$on1 = F2(
	function (event, m) {
		return A2(
			_aforemny$ncms$Material_Options$on,
			event,
			_elm_lang$core$Json_Decode$succeed(m));
	});
var _aforemny$ncms$Material_Options$onToggle = _aforemny$ncms$Material_Options$on1('change');
var _aforemny$ncms$Material_Options$onClick = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onDoubleClick = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onMouseDown = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onMouseUp = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onMouseEnter = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onMouseLeave = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onMouseOver = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onMouseOut = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onCheck = function (_p1) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'change',
		A3(_elm_lang$core$Basics$flip, _elm_lang$core$Json_Decode$map, _elm_lang$html$Html_Events$targetChecked, _p1));
};
var _aforemny$ncms$Material_Options$onBlur = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onFocus = function (msg) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _aforemny$ncms$Material_Options$onInput = function (f) {
	return A2(
		_aforemny$ncms$Material_Options$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, f, _elm_lang$html$Html_Events$targetValue));
};
var _aforemny$ncms$Material_Options$container = _aforemny$ncms$Material_Internal_Options$container;
var _aforemny$ncms$Material_Options$input = _aforemny$ncms$Material_Internal_Options$input;
var _aforemny$ncms$Material_Options$id = function (_p2) {
	return _aforemny$ncms$Material_Internal_Options$Attribute(
		_elm_lang$html$Html_Attributes$id(_p2));
};
var _aforemny$ncms$Material_Options$attr = _aforemny$ncms$Material_Internal_Options$Attribute;
var _aforemny$ncms$Material_Options$attribute = _aforemny$ncms$Material_Internal_Options$Attribute;
var _aforemny$ncms$Material_Options$stylesheet = function (css) {
	return A3(
		_elm_lang$html$Html$node,
		'style',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(css),
			_1: {ctor: '[]'}
		});
};
var _aforemny$ncms$Material_Options$aria = F2(
	function (key, val) {
		return _aforemny$ncms$Material_Internal_Options$Attribute(
			A2(
				_elm_lang$html$Html_Attributes$attribute,
				A2(_elm_lang$core$Basics_ops['++'], 'aria-', key),
				val));
	});
var _aforemny$ncms$Material_Options$data = F2(
	function (key, val) {
		return _aforemny$ncms$Material_Internal_Options$Attribute(
			A2(
				_elm_lang$html$Html_Attributes$attribute,
				A2(_elm_lang$core$Basics_ops['++'], 'data-', key),
				val));
	});
var _aforemny$ncms$Material_Options$nop = _aforemny$ncms$Material_Internal_Options$None;
var _aforemny$ncms$Material_Options$when = F2(
	function (guard, prop) {
		return guard ? prop : _aforemny$ncms$Material_Options$nop;
	});
var _aforemny$ncms$Material_Options$maybe = function (prop) {
	return A2(_elm_lang$core$Maybe$withDefault, _aforemny$ncms$Material_Options$nop, prop);
};
var _aforemny$ncms$Material_Options$many = _aforemny$ncms$Material_Internal_Options$Many;
var _aforemny$ncms$Material_Options$css = F2(
	function (key, value) {
		return _aforemny$ncms$Material_Internal_Options$CSS(
			{ctor: '_Tuple2', _0: key, _1: value});
	});
var _aforemny$ncms$Material_Options$center = _aforemny$ncms$Material_Options$many(
	{
		ctor: '::',
		_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'flex'),
		_1: {
			ctor: '::',
			_0: A2(_aforemny$ncms$Material_Options$css, 'align-items', 'center'),
			_1: {
				ctor: '::',
				_0: A2(_aforemny$ncms$Material_Options$css, 'justify-content', 'center'),
				_1: {ctor: '[]'}
			}
		}
	});
var _aforemny$ncms$Material_Options$scrim = function (opacity) {
	return A2(
		_aforemny$ncms$Material_Options$css,
		'background',
		A2(
			_elm_lang$core$Basics_ops['++'],
			'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(opacity),
				'))')));
};
var _aforemny$ncms$Material_Options$cs = function (c) {
	return _aforemny$ncms$Material_Internal_Options$Class(c);
};
var _aforemny$ncms$Material_Options$disabled = function (v) {
	return _aforemny$ncms$Material_Internal_Options$Attribute(
		_elm_lang$html$Html_Attributes$disabled(v));
};
var _aforemny$ncms$Material_Options$styled_ = F3(
	function (ctor, props, attrs) {
		return ctor(
			A2(
				_aforemny$ncms$Material_Internal_Options$addAttributes,
				_aforemny$ncms$Material_Internal_Options$collect_(props),
				attrs));
	});
var _aforemny$ncms$Material_Options$img = F2(
	function (options, attrs) {
		return A4(
			_aforemny$ncms$Material_Options$styled_,
			_elm_lang$html$Html$img,
			options,
			attrs,
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_Options$styled = F2(
	function (ctor, props) {
		return ctor(
			A2(
				_aforemny$ncms$Material_Internal_Options$addAttributes,
				_aforemny$ncms$Material_Internal_Options$collect_(props),
				{ctor: '[]'}));
	});
var _aforemny$ncms$Material_Options$div = _aforemny$ncms$Material_Options$styled(_elm_lang$html$Html$div);
var _aforemny$ncms$Material_Options$span = _aforemny$ncms$Material_Options$styled(_elm_lang$html$Html$span);

var _aforemny$ncms$Material_Button$_p0 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.button;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{button: x});
		}),
	{});
var _aforemny$ncms$Material_Button$get = _aforemny$ncms$Material_Button$_p0._0;
var _aforemny$ncms$Material_Button$set = _aforemny$ncms$Material_Button$_p0._1;
var _aforemny$ncms$Material_Button$icon = _aforemny$ncms$Material_Options$cs('mdc-button--icon');
var _aforemny$ncms$Material_Button$fab = _aforemny$ncms$Material_Options$cs('mdc-button--fab');
var _aforemny$ncms$Material_Button$minifab = _aforemny$ncms$Material_Options$many(
	{
		ctor: '::',
		_0: _aforemny$ncms$Material_Options$cs('mdc-button--mini-fab'),
		_1: {
			ctor: '::',
			_0: _aforemny$ncms$Material_Button$fab,
			_1: {ctor: '[]'}
		}
	});
var _aforemny$ncms$Material_Button$dense = _aforemny$ncms$Material_Options$cs('mdc-button--dense');
var _aforemny$ncms$Material_Button$darkTheme = _aforemny$ncms$Material_Options$cs('mdc-button--dark-theme');
var _aforemny$ncms$Material_Button$compact = _aforemny$ncms$Material_Options$cs('mdc-button--compact');
var _aforemny$ncms$Material_Button$raised = _aforemny$ncms$Material_Options$cs('mdc-button--raised');
var _aforemny$ncms$Material_Button$flat = _aforemny$ncms$Material_Options$nop;
var _aforemny$ncms$Material_Button$blurAndForward = function (event) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', event),
		'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));');
};
var _aforemny$ncms$Material_Button$type_ = function (_p1) {
	return _aforemny$ncms$Material_Internal_Options$attribute(
		_elm_lang$html$Html_Attributes$type_(_p1));
};
var _aforemny$ncms$Material_Button$accent = _aforemny$ncms$Material_Options$cs('mdc-button--accent');
var _aforemny$ncms$Material_Button$primary = _aforemny$ncms$Material_Options$cs('mdc-button--primary');
var _aforemny$ncms$Material_Button$colored = _aforemny$ncms$Material_Options$cs('mdc-button--colored');
var _aforemny$ncms$Material_Button$plain = _aforemny$ncms$Material_Options$nop;
var _aforemny$ncms$Material_Button$disabled = _aforemny$ncms$Material_Internal_Options$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{disabled: true});
	});
var _aforemny$ncms$Material_Button$ripple = _aforemny$ncms$Material_Internal_Options$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _aforemny$ncms$Material_Button$link = function (href) {
	return _aforemny$ncms$Material_Internal_Options$option(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					link: _elm_lang$core$Maybe$Just(href)
				});
		});
};
var _aforemny$ncms$Material_Button$defaultConfig = {ripple: false, link: _elm_lang$core$Maybe$Nothing, disabled: false};
var _aforemny$ncms$Material_Button$view = F3(
	function (lift, model, options) {
		var _p2 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Button$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		return A4(
			_aforemny$ncms$Material_Internal_Options$apply,
			summary,
			(!_elm_lang$core$Native_Utils.eq(config.link, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$html$Html$a : _elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-button'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('mdc-js-button'),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$when,
							summary.config.ripple,
							_aforemny$ncms$Material_Options$cs('mdc-js-ripple-effect')),
						_1: {
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Options$css, 'box-sizing', 'border-box'),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$when,
									(!_elm_lang$core$Native_Utils.eq(config.link, _elm_lang$core$Maybe$Nothing)) && (!config.disabled),
									_aforemny$ncms$Material_Internal_Options$attribute(
										_elm_lang$html$Html_Attributes$href(
											A2(_elm_lang$core$Maybe$withDefault, '', config.link)))),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Options$when,
										config.disabled,
										_aforemny$ncms$Material_Internal_Options$attribute(
											_elm_lang$html$Html_Attributes$disabled(true))),
									_1: {
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$when,
											config.disabled,
											_aforemny$ncms$Material_Options$cs('mdc-button--disabled')),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Helpers$blurOn('mouseup'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Helpers$blurOn('mouseleave'),
					_1: {
						ctor: '::',
						_0: _aforemny$ncms$Material_Helpers$blurOn('touchend'),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _aforemny$ncms$Material_Button$render = A3(_aforemny$ncms$Material_Component$render, _aforemny$ncms$Material_Button$get, _aforemny$ncms$Material_Button$view, _aforemny$ncms$Material_Msg$ButtonMsg);
var _aforemny$ncms$Material_Button$update = F2(
	function (action, model) {
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			model,
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_Button$react = A4(
	_aforemny$ncms$Material_Component$react,
	_aforemny$ncms$Material_Button$get,
	_aforemny$ncms$Material_Button$set,
	_aforemny$ncms$Material_Msg$ButtonMsg,
	_aforemny$ncms$Material_Component$generalise(_aforemny$ncms$Material_Button$update));
var _aforemny$ncms$Material_Button$defaultModel = {};
var _aforemny$ncms$Material_Button$Model = {};
var _aforemny$ncms$Material_Button$Config = F3(
	function (a, b, c) {
		return {ripple: a, link: b, disabled: c};
	});

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _aforemny$ncms$Material_Checkbox$indeterminate = _aforemny$ncms$Material_Internal_Options$input(
	{
		ctor: '::',
		_0: _aforemny$ncms$Material_Internal_Options$attribute(
			A2(
				_elm_lang$html$Html_Attributes$property,
				'indeterminate',
				_elm_lang$core$Json_Encode$bool(true))),
		_1: {ctor: '[]'}
	});
var _aforemny$ncms$Material_Checkbox$checked = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{value: true});
	});
var _aforemny$ncms$Material_Checkbox$disabled = _aforemny$ncms$Material_Options$many(
	{
		ctor: '::',
		_0: _aforemny$ncms$Material_Options$cs('mdc-checkbox--disabled'),
		_1: {
			ctor: '::',
			_0: _aforemny$ncms$Material_Internal_Options$input(
				{
					ctor: '::',
					_0: _aforemny$ncms$Material_Internal_Options$attribute(
						_elm_lang$html$Html_Attributes$disabled(true)),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		}
	});
var _aforemny$ncms$Material_Checkbox$defaultConfig = {
	input: {ctor: '[]'},
	container: {ctor: '[]'},
	value: false
};
var _aforemny$ncms$Material_Checkbox$view = F4(
	function (lift, model, options, _p0) {
		var _p1 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Checkbox$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		return A4(
			_aforemny$ncms$Material_Internal_Options$applyContainer,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-checkbox'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Internal_Options$attribute(
						_aforemny$ncms$Material_Helpers$blurOn('mouseup')),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A4(
					_aforemny$ncms$Material_Internal_Options$applyInput,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-checkbox__native-control'),
						_1: {
							ctor: '::',
							_0: _aforemny$ncms$Material_Internal_Options$attribute(
								_elm_lang$html$Html_Attributes$type_('checkbox')),
							_1: {
								ctor: '::',
								_0: _aforemny$ncms$Material_Internal_Options$attribute(
									_elm_lang$html$Html_Attributes$checked(config.value)),
								_1: {
									ctor: '::',
									_0: A3(
										_aforemny$ncms$Material_Internal_Options$on1,
										'focus',
										lift,
										_aforemny$ncms$Material_Internal_Checkbox$SetFocus(true)),
									_1: {
										ctor: '::',
										_0: A3(
											_aforemny$ncms$Material_Internal_Options$on1,
											'blur',
											lift,
											_aforemny$ncms$Material_Internal_Checkbox$SetFocus(false)),
										_1: {
											ctor: '::',
											_0: A3(
												_aforemny$ncms$Material_Options$onWithOptions,
												'click',
												{preventDefault: true, stopPropagation: false},
												_elm_lang$core$Json_Decode$succeed(
													lift(_aforemny$ncms$Material_Internal_Checkbox$NoOp))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-checkbox__background'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$svg,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$class('mdc-checkbox__checkmark'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 24 24'),
										_1: {ctor: '[]'}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$path,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$class('mdc-checkbox__checkmark__path'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('none'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$stroke('white'),
													_1: {
														ctor: '::',
														_0: _elm_lang$svg$Svg_Attributes$d('M1.73,12.91 8.1,19.28 22.79,4.59'),
														_1: {ctor: '[]'}
													}
												}
											}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A3(
									_aforemny$ncms$Material_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _aforemny$ncms$Material_Options$cs('mdc-checkbox__mixedmark'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _aforemny$ncms$Material_Checkbox$update = F3(
	function (_p2, msg, model) {
		var _p3 = msg;
		if (_p3.ctor === 'SetFocus') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					_elm_lang$core$Native_Utils.update(
						model,
						{isFocused: _p3._0})),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _aforemny$ncms$Material_Checkbox$defaultModel = {isFocused: false};
var _aforemny$ncms$Material_Checkbox$_p4 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.checkbox;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{checkbox: x});
		}),
	_aforemny$ncms$Material_Checkbox$defaultModel);
var _aforemny$ncms$Material_Checkbox$get = _aforemny$ncms$Material_Checkbox$_p4._0;
var _aforemny$ncms$Material_Checkbox$set = _aforemny$ncms$Material_Checkbox$_p4._1;
var _aforemny$ncms$Material_Checkbox$react = A4(_aforemny$ncms$Material_Component$react, _aforemny$ncms$Material_Checkbox$get, _aforemny$ncms$Material_Checkbox$set, _aforemny$ncms$Material_Msg$CheckboxMsg, _aforemny$ncms$Material_Checkbox$update);
var _aforemny$ncms$Material_Checkbox$render = F4(
	function (lift, index, store, options) {
		return A7(
			_aforemny$ncms$Material_Component$render,
			_aforemny$ncms$Material_Checkbox$get,
			_aforemny$ncms$Material_Checkbox$view,
			_aforemny$ncms$Material_Msg$CheckboxMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$dispatch(lift),
				_1: options
			});
	});
var _aforemny$ncms$Material_Checkbox$Model = function (a) {
	return {isFocused: a};
};
var _aforemny$ncms$Material_Checkbox$Config = F3(
	function (a, b, c) {
		return {input: a, container: b, value: c};
	});

var _aforemny$ncms$Material_Drawer$toolbarSpacer = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-persistent-drawer__toolbar-spacer'),
			_1: options
		});
};
var _aforemny$ncms$Material_Drawer$toggle = F3(
	function (permanent, lift, idx) {
		return _aforemny$ncms$Material_Helpers$cmd(
			lift(
				A2(
					_aforemny$ncms$Material_Msg$DrawerMsg,
					idx,
					_aforemny$ncms$Material_Internal_Drawer$Toggle(permanent))));
	});
var _aforemny$ncms$Material_Drawer$close = F2(
	function (lift, idx) {
		return _aforemny$ncms$Material_Helpers$cmd(
			lift(
				A2(_aforemny$ncms$Material_Msg$DrawerMsg, idx, _aforemny$ncms$Material_Internal_Drawer$Close)));
	});
var _aforemny$ncms$Material_Drawer$open = F3(
	function (persistent, lift, idx) {
		return _aforemny$ncms$Material_Helpers$cmd(
			lift(
				A2(
					_aforemny$ncms$Material_Msg$DrawerMsg,
					idx,
					_aforemny$ncms$Material_Internal_Drawer$Open(persistent))));
	});
var _aforemny$ncms$Material_Drawer$subscriptions = function (model) {
	return model.open ? _elm_lang$mouse$Mouse$clicks(
		function (_p0) {
			return _aforemny$ncms$Material_Internal_Drawer$Click;
		}) : _elm_lang$core$Platform_Sub$none;
};
var _aforemny$ncms$Material_Drawer$subs = A3(
	_aforemny$ncms$Material_Component$subs,
	_aforemny$ncms$Material_Msg$DrawerMsg,
	function (_) {
		return _.drawer;
	},
	_aforemny$ncms$Material_Drawer$subscriptions);
var _aforemny$ncms$Material_Drawer$modifier = F2(
	function (className, name) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			className,
			A2(_elm_lang$core$Basics_ops['++'], '--', name));
	});
var _aforemny$ncms$Material_Drawer$element = F2(
	function (className, name) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			className,
			A2(_elm_lang$core$Basics_ops['++'], '__', name));
	});
var _aforemny$ncms$Material_Drawer$header = F2(
	function (className, options) {
		return A2(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$header,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs(
					A2(_aforemny$ncms$Material_Drawer$element, className, 'header')),
				_1: options
			});
	});
var _aforemny$ncms$Material_Drawer$headerContent = F2(
	function (className, options) {
		return A2(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs(
					A2(_aforemny$ncms$Material_Drawer$element, className, 'header-content')),
				_1: options
			});
	});
var _aforemny$ncms$Material_Drawer$content = F2(
	function (className, options) {
		return A2(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$nav,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs(
					A2(_aforemny$ncms$Material_Drawer$element, className, 'content')),
				_1: options
			});
	});
var _aforemny$ncms$Material_Drawer$defaultConfig = {
	input: {ctor: '[]'},
	container: {ctor: '[]'},
	value: false
};
var _aforemny$ncms$Material_Drawer$view = F5(
	function (className, lift, model, options, nodes) {
		var _p1 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Drawer$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		return A4(
			_aforemny$ncms$Material_Internal_Options$applyContainer,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs(className),
				_1: {
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Options$when,
						model.open,
						_aforemny$ncms$Material_Options$cs(
							A2(_aforemny$ncms$Material_Drawer$modifier, className, 'open'))),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$when,
							model.animating,
							_aforemny$ncms$Material_Options$cs(
								A2(_aforemny$ncms$Material_Drawer$modifier, className, 'animating'))),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A3(
					_aforemny$ncms$Material_Options$styled,
					_elm_lang$html$Html$nav,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs(
							A2(_aforemny$ncms$Material_Drawer$element, className, 'drawer')),
						_1: {
							ctor: '::',
							_0: A3(
								_aforemny$ncms$Material_Options$onWithOptions,
								'click',
								{stopPropagation: false, preventDefault: false},
								_elm_lang$core$Json_Decode$succeed(
									lift(_aforemny$ncms$Material_Internal_Drawer$NoOp))),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$when,
									model.open,
									A2(_aforemny$ncms$Material_Options$css, 'transform', 'translateX(0)')),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Options$when,
										model.animating,
										A2(
											_aforemny$ncms$Material_Options$on,
											'transitionend',
											_elm_lang$core$Json_Decode$succeed(
												lift(_aforemny$ncms$Material_Internal_Drawer$Tick)))),
									_1: options
								}
							}
						}
					},
					nodes),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Drawer$update = F3(
	function (fwd, msg, model) {
		update:
		while (true) {
			var _p2 = msg;
			switch (_p2.ctor) {
				case 'NoOp':
					return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
				case 'Tick':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									state: _elm_lang$core$Maybe$Just(model.open),
									animating: false
								})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'Click':
					if (model.persistent) {
						return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
					} else {
						var _v1 = fwd,
							_v2 = _aforemny$ncms$Material_Internal_Drawer$Close,
							_v3 = model;
						fwd = _v1;
						msg = _v2;
						model = _v3;
						continue update;
					}
				case 'Open':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{open: true, state: _elm_lang$core$Maybe$Nothing, animating: true, persistent: _p2._0})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				case 'Close':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{open: false, state: _elm_lang$core$Maybe$Nothing, animating: true})),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				default:
					if (model.open) {
						var _v4 = fwd,
							_v5 = _aforemny$ncms$Material_Internal_Drawer$Close,
							_v6 = model;
						fwd = _v4;
						msg = _v5;
						model = _v6;
						continue update;
					} else {
						var _v7 = fwd,
							_v8 = _aforemny$ncms$Material_Internal_Drawer$Open(_p2._0),
							_v9 = model;
						fwd = _v7;
						msg = _v8;
						model = _v9;
						continue update;
					}
			}
		}
	});
var _aforemny$ncms$Material_Drawer$defaultModel = {open: false, state: _elm_lang$core$Maybe$Nothing, animating: false, persistent: false};
var _aforemny$ncms$Material_Drawer$_p3 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.drawer;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{drawer: x});
		}),
	_aforemny$ncms$Material_Drawer$defaultModel);
var _aforemny$ncms$Material_Drawer$get = _aforemny$ncms$Material_Drawer$_p3._0;
var _aforemny$ncms$Material_Drawer$set = _aforemny$ncms$Material_Drawer$_p3._1;
var _aforemny$ncms$Material_Drawer$react = A4(_aforemny$ncms$Material_Component$react, _aforemny$ncms$Material_Drawer$get, _aforemny$ncms$Material_Drawer$set, _aforemny$ncms$Material_Msg$DrawerMsg, _aforemny$ncms$Material_Drawer$update);
var _aforemny$ncms$Material_Drawer$render = F5(
	function (className, lift, index, store, options) {
		return A7(
			_aforemny$ncms$Material_Component$render,
			_aforemny$ncms$Material_Drawer$get,
			_aforemny$ncms$Material_Drawer$view(className),
			_aforemny$ncms$Material_Msg$DrawerMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$dispatch(lift),
				_1: options
			});
	});
var _aforemny$ncms$Material_Drawer$Model = F4(
	function (a, b, c, d) {
		return {open: a, state: b, animating: c, persistent: d};
	});
var _aforemny$ncms$Material_Drawer$Config = F3(
	function (a, b, c) {
		return {input: a, container: b, value: c};
	});

var _aforemny$ncms$Material_Fab$disabled = _aforemny$ncms$Material_Internal_Options$option(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{disabled: true});
	});
var _aforemny$ncms$Material_Fab$mini = _aforemny$ncms$Material_Options$cs('mdc-fab--mini');
var _aforemny$ncms$Material_Fab$plain = _aforemny$ncms$Material_Options$cs('mdc-fab--plain');
var _aforemny$ncms$Material_Fab$defaultConfig = {disabled: false};
var _aforemny$ncms$Material_Fab$view = F4(
	function (lift, model, options, icon) {
		var _p0 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Fab$defaultConfig, options);
		var summary = _p0;
		var config = _p0.config;
		return A5(
			_aforemny$ncms$Material_Internal_Options$apply,
			summary,
			_elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-fab'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$when,
							config.disabled,
							_aforemny$ncms$Material_Internal_Options$attribute(
								_elm_lang$html$Html_Attributes$disabled(true))),
						_1: {
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Options$when,
								config.disabled,
								_aforemny$ncms$Material_Options$cs('mdc-fab--disabled')),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_aforemny$ncms$Material_Options$styled,
					_elm_lang$html$Html$span,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-fab__icon'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(icon),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Fab$update = F2(
	function (msg, model) {
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			model,
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_Fab$defaultModel = {};
var _aforemny$ncms$Material_Fab$_p1 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.fab;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{fab: x});
		}),
	_aforemny$ncms$Material_Fab$defaultModel);
var _aforemny$ncms$Material_Fab$get = _aforemny$ncms$Material_Fab$_p1._0;
var _aforemny$ncms$Material_Fab$set = _aforemny$ncms$Material_Fab$_p1._1;
var _aforemny$ncms$Material_Fab$react = A4(
	_aforemny$ncms$Material_Component$react,
	_aforemny$ncms$Material_Fab$get,
	_aforemny$ncms$Material_Fab$set,
	_aforemny$ncms$Material_Msg$FabMsg,
	_aforemny$ncms$Material_Component$generalise(_aforemny$ncms$Material_Fab$update));
var _aforemny$ncms$Material_Fab$render = A3(_aforemny$ncms$Material_Component$render, _aforemny$ncms$Material_Fab$get, _aforemny$ncms$Material_Fab$view, _aforemny$ncms$Material_Msg$FabMsg);
var _aforemny$ncms$Material_Fab$Model = {};
var _aforemny$ncms$Material_Fab$Config = function (a) {
	return {disabled: a};
};

var _aforemny$ncms$Material_IconToggle$disabled = _aforemny$ncms$Material_Options$cs('mdc-icon-toggle--disabled');
var _aforemny$ncms$Material_IconToggle$accent = _aforemny$ncms$Material_Options$cs('mdc-icon-toggle--accent');
var _aforemny$ncms$Material_IconToggle$primary = _aforemny$ncms$Material_Options$cs('mdc-icon-toggle--primary');
var _aforemny$ncms$Material_IconToggle$inner = function (_p0) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						inner: _elm_lang$core$Maybe$Just(value)
					});
			})(_p0));
};
var _aforemny$ncms$Material_IconToggle$label = F2(
	function (on, off) {
		return _aforemny$ncms$Material_Internal_Options$option(
			function (config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						label: {on: on, off: off}
					});
			});
	});
var _aforemny$ncms$Material_IconToggle$icon = F2(
	function (on, off) {
		return _aforemny$ncms$Material_Internal_Options$option(
			function (config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						icon: {on: on, off: off}
					});
			});
	});
var _aforemny$ncms$Material_IconToggle$on = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{on: true});
	});
var _aforemny$ncms$Material_IconToggle$defaultConfig = {
	on: false,
	label: {on: '', off: ''},
	icon: {on: '', off: ''},
	inner: _elm_lang$core$Maybe$Nothing
};
var _aforemny$ncms$Material_IconToggle$view = F4(
	function (lift, model, options, _p1) {
		var _p2 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_IconToggle$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		return A5(
			_aforemny$ncms$Material_Internal_Options$apply,
			summary,
			_elm_lang$core$Native_Utils.eq(config.inner, _elm_lang$core$Maybe$Nothing) ? _elm_lang$html$Html$i : _elm_lang$html$Html$span,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-icon-toggle'),
				_1: {
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Options$when,
						_elm_lang$core$Native_Utils.eq(config.inner, _elm_lang$core$Maybe$Nothing),
						_aforemny$ncms$Material_Options$cs('material-icons')),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$aria,
							'label',
							config.on ? config.label.on : config.label.off),
						_1: options
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: (!_elm_lang$core$Native_Utils.eq(config.inner, _elm_lang$core$Maybe$Nothing)) ? A3(
					_aforemny$ncms$Material_Options$styled,
					_elm_lang$html$Html$i,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs(
							A2(_elm_lang$core$Maybe$withDefault, 'material-icons', config.inner)),
						_1: {
							ctor: '::',
							_0: config.on ? _aforemny$ncms$Material_Options$cs(config.icon.on) : _aforemny$ncms$Material_Options$cs(config.icon.off),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}) : _elm_lang$html$Html$text(
					config.on ? config.icon.on : config.icon.off),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_IconToggle$update = F2(
	function (msg, model) {
		var _p3 = msg;
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			model,
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_IconToggle$defaultModel = false;
var _aforemny$ncms$Material_IconToggle$_p4 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.iconToggle;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{iconToggle: x});
		}),
	_aforemny$ncms$Material_IconToggle$defaultModel);
var _aforemny$ncms$Material_IconToggle$get = _aforemny$ncms$Material_IconToggle$_p4._0;
var _aforemny$ncms$Material_IconToggle$set = _aforemny$ncms$Material_IconToggle$_p4._1;
var _aforemny$ncms$Material_IconToggle$react = A4(
	_aforemny$ncms$Material_Component$react,
	_aforemny$ncms$Material_IconToggle$get,
	_aforemny$ncms$Material_IconToggle$set,
	_aforemny$ncms$Material_Msg$IconToggleMsg,
	_aforemny$ncms$Material_Component$generalise(_aforemny$ncms$Material_IconToggle$update));
var _aforemny$ncms$Material_IconToggle$render = A3(_aforemny$ncms$Material_Component$render, _aforemny$ncms$Material_IconToggle$get, _aforemny$ncms$Material_IconToggle$view, _aforemny$ncms$Material_Msg$IconToggleMsg);
var _aforemny$ncms$Material_IconToggle$Config = F4(
	function (a, b, c, d) {
		return {on: a, label: b, icon: c, inner: d};
	});

var _aforemny$ncms$Material_Menu$onSelect = _aforemny$ncms$Material_Options$on('click');
var _aforemny$ncms$Material_Menu$toPx = function (_p0) {
	return A3(
		_elm_lang$core$Basics$flip,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'px',
		_elm_lang$core$Basics$toString(_p0));
};
var _aforemny$ncms$Material_Menu$rect = F4(
	function (x, y, w, h) {
		return function (coords) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'rect(',
				A2(_elm_lang$core$Basics_ops['++'], coords, ')'));
		}(
			A2(
				_elm_lang$core$String$join,
				' ',
				A2(
					_elm_lang$core$List$map,
					_aforemny$ncms$Material_Menu$toPx,
					{
						ctor: '::',
						_0: x,
						_1: {
							ctor: '::',
							_0: y,
							_1: {
								ctor: '::',
								_0: w,
								_1: {
									ctor: '::',
									_0: h,
									_1: {ctor: '[]'}
								}
							}
						}
					})));
	});
var _aforemny$ncms$Material_Menu$decodeGeometry = A6(
	_elm_lang$core$Json_Decode$map5,
	_aforemny$ncms$Material_Internal_Menu$Geometry,
	A2(
		_debois$elm_dom$DOM$childNode,
		0,
		A3(
			_elm_lang$core$Json_Decode$map2,
			F2(
				function (offsetWidth, offsetHeight) {
					return {width: offsetWidth, height: offsetHeight};
				}),
			_debois$elm_dom$DOM$offsetWidth,
			_debois$elm_dom$DOM$offsetHeight)),
	A2(
		_debois$elm_dom$DOM$childNode,
		0,
		_debois$elm_dom$DOM$childNodes(
			A3(
				_elm_lang$core$Json_Decode$map2,
				F2(
					function (offsetTop, offsetHeight) {
						return {top: offsetTop, height: offsetHeight};
					}),
				_debois$elm_dom$DOM$offsetTop,
				_debois$elm_dom$DOM$offsetHeight))),
	_elm_lang$core$Json_Decode$succeed(
		{isRtl: false}),
	A2(
		_elm_lang$core$Json_Decode$map,
		function (rect) {
			return {top: rect.top, left: rect.left, bottom: rect.top + rect.height, right: rect.left + rect.width};
		},
		_debois$elm_dom$DOM$parentElement(_debois$elm_dom$DOM$boundingClientRect)),
	function () {
		var traverseToRoot = function (decoder) {
			return _elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _debois$elm_dom$DOM$parentElement(
						_elm_lang$core$Json_Decode$lazy(
							function (_p1) {
								return traverseToRoot(decoder);
							})),
					_1: {
						ctor: '::',
						_0: decoder,
						_1: {ctor: '[]'}
					}
				});
		};
		return traverseToRoot(
			A3(
				_elm_lang$core$Json_Decode$map2,
				F2(
					function (clientWidth, clientHeight) {
						return {width: clientWidth, height: clientHeight};
					}),
				_debois$elm_dom$DOM$offsetWidth,
				_debois$elm_dom$DOM$offsetHeight));
	}());
var _aforemny$ncms$Material_Menu$decodeGeometryOnButton = _debois$elm_dom$DOM$target(
	_debois$elm_dom$DOM$nextSibling(_aforemny$ncms$Material_Menu$decodeGeometry));
var _aforemny$ncms$Material_Menu$decodeKeyCode = _elm_lang$html$Html_Events$keyCode;
var _aforemny$ncms$Material_Menu$decodeKey = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'key',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _aforemny$ncms$Material_Menu$decodeMeta = A5(
	_elm_lang$core$Json_Decode$map4,
	F4(
		function (altKey, ctrlKey, metaKey, shiftKey) {
			return {altKey: altKey, ctrlKey: ctrlKey, metaKey: metaKey, shiftKey: shiftKey};
		}),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'altKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'ctrlKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'metaKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool),
	A2(
		_elm_lang$core$Json_Decode$at,
		{
			ctor: '::',
			_0: 'shiftKey',
			_1: {ctor: '[]'}
		},
		_elm_lang$core$Json_Decode$bool));
var _aforemny$ncms$Material_Menu$index = function (_p2) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (index, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						index: _elm_lang$core$Maybe$Just(index)
					});
			})(_p2));
};
var _aforemny$ncms$Material_Menu$open = _aforemny$ncms$Material_Options$cs('mdc-simple-menu--open');
var _aforemny$ncms$Material_Menu$defaultConfig = {index: _elm_lang$core$Maybe$Nothing, alignment: _elm_lang$core$Maybe$Nothing};
var _aforemny$ncms$Material_Menu$update = F3(
	function (fwd, msg, model) {
		update:
		while (true) {
			var _p3 = msg;
			switch (_p3.ctor) {
				case 'Toggle':
					var _v1 = fwd,
						_v2 = (model.open ? _aforemny$ncms$Material_Internal_Menu$Close : _aforemny$ncms$Material_Internal_Menu$Open)(_p3._0),
						_v3 = model;
					fwd = _v1;
					msg = _v2;
					model = _v3;
					continue update;
				case 'Open':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								open: true,
								geometry: _elm_lang$core$Maybe$Just(_p3._0),
								animating: true,
								time: 0,
								startScaleX: model.scaleX,
								startScaleY: model.scaleY
							}),
						{ctor: '[]'});
				case 'Close':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								open: false,
								geometry: _elm_lang$core$Maybe$Just(_p3._0),
								animating: true,
								time: 0,
								startScaleX: model.scaleX,
								startScaleY: model.scaleY
							}),
						{ctor: '[]'});
				case 'Click':
					var geometry = A2(_elm_lang$core$Maybe$withDefault, _aforemny$ncms$Material_Internal_Menu$defaultGeometry, model.geometry);
					if (model.open) {
						var _v4 = fwd,
							_v5 = _aforemny$ncms$Material_Internal_Menu$Close(geometry),
							_v6 = model;
						fwd = _v4;
						msg = _v5;
						model = _v6;
						continue update;
					} else {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					}
				case 'Tick':
					var startScaleY = function () {
						var geometry = A2(_elm_lang$core$Maybe$withDefault, _aforemny$ncms$Material_Internal_Menu$defaultGeometry, model.geometry);
						var height = geometry.itemsContainer.height;
						var itemHeight = A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							A2(
								_elm_lang$core$Maybe$map,
								function (_) {
									return _.height;
								},
								_elm_lang$core$List$head(geometry.itemGeometries)));
						return model.open ? A2(
							_elm_lang$core$Basics$max,
							_elm_lang$core$Native_Utils.eq(height, 0) ? 0 : (itemHeight / height),
							model.startScaleY) : model.startScaleY;
					}();
					var startScaleX = model.startScaleX;
					var targetScale = model.open ? 1 : 0;
					var time = A3(_elm_lang$core$Basics$clamp, 0, 1, model.time + _p3._0);
					var transitionY2 = 1;
					var transitionX2 = 0.2;
					var transitionY1 = 0;
					var transitionX1 = 0;
					var transitionScaleAdjustmentY = 0.2;
					var timeY = model.open ? A3(_elm_lang$core$Basics$clamp, 0, 1, (time - transitionScaleAdjustmentY) / (1 - transitionScaleAdjustmentY)) : A3(_elm_lang$core$Basics$clamp, 0, 1, time);
					var easeY = timeY;
					var scaleY = startScaleY + ((targetScale - startScaleY) * easeY);
					var invScaleY = 1 / (_elm_lang$core$Native_Utils.eq(scaleY, 0) ? 1 : scaleY);
					var transitionScaleAdjustmentX = 0.5;
					var timeX = model.open ? A3(_elm_lang$core$Basics$clamp, 0, 1, time + transitionScaleAdjustmentX) : A3(_elm_lang$core$Basics$clamp, 0, 1, (time - transitionScaleAdjustmentX) / (1 - transitionScaleAdjustmentX));
					var easeX = timeX;
					var scaleX = startScaleX + ((targetScale - startScaleX) * easeX);
					var invScaleX = 1 / (_elm_lang$core$Native_Utils.eq(scaleX, 0) ? 1 : scaleX);
					var transitionDurationMs = 300;
					var selectedTriggerDelay = 50;
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								time: time,
								animating: _elm_lang$core$Native_Utils.cmp(time, 1) < 0,
								scaleX: scaleX,
								scaleY: scaleX,
								invScaleX: invScaleX,
								invScaleY: invScaleY
							}),
						{ctor: '[]'});
				case 'KeyDown':
					var _p5 = _p3._2;
					var _p4 = _p3._1;
					var isSpace = _elm_lang$core$Native_Utils.eq(_p4, 'Space') || _elm_lang$core$Native_Utils.eq(_p5, 32);
					var isArrowDown = _elm_lang$core$Native_Utils.eq(_p4, 'ArrowDown') || _elm_lang$core$Native_Utils.eq(_p5, 40);
					var isArrowUp = _elm_lang$core$Native_Utils.eq(_p4, 'ArrowUp') || _elm_lang$core$Native_Utils.eq(_p5, 38);
					var isTab = _elm_lang$core$Native_Utils.eq(_p4, 'Tab') || _elm_lang$core$Native_Utils.eq(_p5, 9);
					return (_p3._0.altKey || (_p3._0.ctrlKey || _p3._0.metaKey)) ? A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						model,
						{ctor: '[]'}) : A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						model,
						{ctor: '[]'});
				default:
					var _p7 = _p3._2;
					var _p6 = _p3._1;
					var geometry = A2(_elm_lang$core$Maybe$withDefault, _aforemny$ncms$Material_Internal_Menu$defaultGeometry, model.geometry);
					var isEscape = _elm_lang$core$Native_Utils.eq(_p6, 'Escape') || _elm_lang$core$Native_Utils.eq(_p7, 27);
					var isSpace = _elm_lang$core$Native_Utils.eq(_p6, 'Space') || _elm_lang$core$Native_Utils.eq(_p7, 32);
					var isEnter = _elm_lang$core$Native_Utils.eq(_p6, 'Enter') || _elm_lang$core$Native_Utils.eq(_p7, 13);
					if (_p3._0.altKey || (_p3._0.ctrlKey || _p3._0.metaKey)) {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					} else {
						if (isEnter || isSpace) {
							var _v7 = fwd,
								_v8 = _aforemny$ncms$Material_Internal_Menu$Close(geometry),
								_v9 = model;
							fwd = _v7;
							msg = _v8;
							model = _v9;
							continue update;
						} else {
							if (isEscape) {
								var _v10 = fwd,
									_v11 = _aforemny$ncms$Material_Internal_Menu$Close(geometry),
									_v12 = model;
								fwd = _v10;
								msg = _v11;
								model = _v12;
								continue update;
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						}
					}
			}
		}
	});
var _aforemny$ncms$Material_Menu$connect = function (lift) {
	return _aforemny$ncms$Material_Options$many(
		{
			ctor: '::',
			_0: A2(
				_aforemny$ncms$Material_Options$on,
				'click',
				A2(
					_elm_lang$core$Json_Decode$map,
					function (_p8) {
						return lift(
							_aforemny$ncms$Material_Internal_Menu$Toggle(_p8));
					},
					_aforemny$ncms$Material_Menu$decodeGeometryOnButton)),
			_1: {ctor: '[]'}
		});
};
var _aforemny$ncms$Material_Menu$attach = F2(
	function (lift, idx) {
		return _aforemny$ncms$Material_Options$many(
			{
				ctor: '::',
				_0: A2(
					_aforemny$ncms$Material_Options$on,
					'click',
					A2(
						_elm_lang$core$Json_Decode$map,
						function (_p9) {
							return lift(
								A2(
									_aforemny$ncms$Material_Msg$MenuMsg,
									idx,
									_aforemny$ncms$Material_Internal_Menu$Toggle(_p9)));
						},
						_aforemny$ncms$Material_Menu$decodeGeometryOnButton)),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Menu$ul = F3(
	function (node, options, items) {
		return {node: node, options: options, items: items};
	});
var _aforemny$ncms$Material_Menu$li = F3(
	function (node, options, childs) {
		return {node: node, options: options, childs: childs};
	});
var _aforemny$ncms$Material_Menu$defaultModel = {index: _elm_lang$core$Maybe$Nothing, open: false, geometry: _elm_lang$core$Maybe$Nothing, animating: false, time: 0, startScaleX: 0, startScaleY: 0, scaleX: 0, scaleY: 0, invScaleX: 1, invScaleY: 1};
var _aforemny$ncms$Material_Menu$_p10 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_aforemny$ncms$Material_Menu$defaultModel);
var _aforemny$ncms$Material_Menu$get = _aforemny$ncms$Material_Menu$_p10._0;
var _aforemny$ncms$Material_Menu$set = _aforemny$ncms$Material_Menu$_p10._1;
var _aforemny$ncms$Material_Menu$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			function (_p11) {
				return _elm_lang$core$Maybe$Just(
					A3(_aforemny$ncms$Material_Menu$set, idx, store, _p11));
			},
			A3(
				_aforemny$ncms$Material_Menu$update,
				lift,
				msg,
				A2(_aforemny$ncms$Material_Menu$get, idx, store)));
	});
var _aforemny$ncms$Material_Menu$subscriptions = function (model) {
	var transitionDurationMs = 300;
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: model.open ? _elm_lang$mouse$Mouse$clicks(_aforemny$ncms$Material_Internal_Menu$Click) : _elm_lang$core$Platform_Sub$none,
			_1: {
				ctor: '::',
				_0: model.animating ? _elm_lang$core$Platform_Sub$none : _elm_lang$core$Platform_Sub$none,
				_1: {ctor: '[]'}
			}
		});
};
var _aforemny$ncms$Material_Menu$subs = A3(
	_aforemny$ncms$Material_Component$subs,
	_aforemny$ncms$Material_Msg$MenuMsg,
	function (_) {
		return _.menu;
	},
	_aforemny$ncms$Material_Menu$subscriptions);
var _aforemny$ncms$Material_Menu$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {index: a, open: b, geometry: c, animating: d, time: e, startScaleX: f, startScaleY: g, scaleX: h, scaleY: i, invScaleX: j, invScaleY: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _aforemny$ncms$Material_Menu$Item = F3(
	function (a, b, c) {
		return {node: a, options: b, childs: c};
	});
var _aforemny$ncms$Material_Menu$Config = F2(
	function (a, b) {
		return {index: a, alignment: b};
	});
var _aforemny$ncms$Material_Menu$OpenFromBottomRight = {ctor: 'OpenFromBottomRight'};
var _aforemny$ncms$Material_Menu$openFromBottomRight = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				alignment: _elm_lang$core$Maybe$Just(_aforemny$ncms$Material_Menu$OpenFromBottomRight)
			});
	});
var _aforemny$ncms$Material_Menu$OpenFromBottomLeft = {ctor: 'OpenFromBottomLeft'};
var _aforemny$ncms$Material_Menu$openFromBottomLeft = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				alignment: _elm_lang$core$Maybe$Just(_aforemny$ncms$Material_Menu$OpenFromBottomLeft)
			});
	});
var _aforemny$ncms$Material_Menu$OpenFromTopRight = {ctor: 'OpenFromTopRight'};
var _aforemny$ncms$Material_Menu$openFromTopRight = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				alignment: _elm_lang$core$Maybe$Just(_aforemny$ncms$Material_Menu$OpenFromTopRight)
			});
	});
var _aforemny$ncms$Material_Menu$OpenFromTopLeft = {ctor: 'OpenFromTopLeft'};
var _aforemny$ncms$Material_Menu$openFromTopLeft = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				alignment: _elm_lang$core$Maybe$Just(_aforemny$ncms$Material_Menu$OpenFromTopLeft)
			});
	});
var _aforemny$ncms$Material_Menu$view = F4(
	function (lift, model, options, ul) {
		var geometry = A2(_elm_lang$core$Maybe$withDefault, _aforemny$ncms$Material_Internal_Menu$defaultGeometry, model.geometry);
		var _p12 = function () {
			var height = geometry.itemsContainer.height;
			var width = geometry.itemsContainer.width;
			var anchor = geometry.anchor;
			var bottomOverflow = height - anchor.bottom;
			var rightOverflow = width - anchor.right;
			var extendsBeyondRightBounds = _elm_lang$core$Native_Utils.cmp(rightOverflow, 0) > 0;
			var adapter = geometry.adapter;
			var windowHeight = geometry.window.height;
			var topOverflow = (anchor.top + height) + windowHeight;
			var extendsBeyondTopBounds = _elm_lang$core$Native_Utils.cmp(topOverflow, 0) > 0;
			var vertical = (extendsBeyondTopBounds && (_elm_lang$core$Native_Utils.cmp(bottomOverflow, topOverflow) < 0)) ? 'bottom' : 'top';
			var windowWidth = geometry.window.width;
			var leftOverflow = (anchor.left + width) + windowWidth;
			var extendsBeyondLeftBounds = _elm_lang$core$Native_Utils.cmp(leftOverflow, 0) > 0;
			var horizontal = adapter.isRtl ? ((extendsBeyondRightBounds && (_elm_lang$core$Native_Utils.cmp(leftOverflow, rightOverflow) < 0)) ? 'left' : 'right') : ((extendsBeyondLeftBounds && (_elm_lang$core$Native_Utils.cmp(rightOverflow, leftOverflow) < 0)) ? 'right' : 'left');
			var transformOrigin = A2(
				_elm_lang$core$Basics_ops['++'],
				vertical,
				A2(_elm_lang$core$Basics_ops['++'], ' ', horizontal));
			var position = {horizontal: horizontal, vertical: vertical};
			return {ctor: '_Tuple2', _0: position, _1: transformOrigin};
		}();
		var position = _p12._0;
		var transformOrigin = _p12._1;
		var _p13 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Menu$defaultConfig, options);
		var summary = _p13;
		var config = _p13.config;
		var transitionDelay = F2(
			function (i, itemGeometry) {
				var toFixed = function (value) {
					return _elm_lang$core$Basics$toFloat(
						_elm_lang$core$Basics$floor(1000 * value)) / 1000;
				};
				var itemHeight = itemGeometry.height;
				var itemTop = itemGeometry.top;
				var transitionScaleAdjustmentY = 0.2;
				var start = transitionScaleAdjustmentY;
				var transitionDurationMs = 300;
				var transitionDuration = transitionDurationMs / 1000;
				var height = geometry.itemsContainer.height;
				var itemDelayFraction = _elm_lang$core$Native_Utils.eq(height, 0) ? 0 : ((_elm_lang$core$Native_Utils.eq(
					config.alignment,
					_elm_lang$core$Maybe$Just(_aforemny$ncms$Material_Menu$OpenFromBottomLeft)) || _elm_lang$core$Native_Utils.eq(
					config.alignment,
					_elm_lang$core$Maybe$Just(_aforemny$ncms$Material_Menu$OpenFromBottomRight))) ? (((height - itemTop) - itemHeight) / height) : (itemTop / height));
				var itemDelay = (start + (itemDelayFraction * (1 - start))) * transitionDuration;
				var numItems = _elm_lang$core$List$length(ul.items);
				return toFixed(itemDelay);
			});
		return A5(
			_aforemny$ncms$Material_Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-simple-menu'),
				_1: {
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Options$when,
						model.open,
						_aforemny$ncms$Material_Options$cs('mdc-simple-menu--open')),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$when,
							model.animating,
							_aforemny$ncms$Material_Options$cs('mdc-simple-menu--animating')),
						_1: {
							ctor: '::',
							_0: function (_p14) {
								return A2(
									_aforemny$ncms$Material_Options$when,
									!_elm_lang$core$Native_Utils.eq(config.alignment, _elm_lang$core$Maybe$Nothing),
									_aforemny$ncms$Material_Options$cs(_p14));
							}(
								function () {
									var _p15 = A2(_elm_lang$core$Maybe$withDefault, _aforemny$ncms$Material_Menu$OpenFromTopLeft, config.alignment);
									switch (_p15.ctor) {
										case 'OpenFromTopLeft':
											return 'mdc-simple-menu--open-from-top-left';
										case 'OpenFromTopRight':
											return 'mdc-simple-menu--open-from-top-right';
										case 'OpenFromBottomLeft':
											return 'mdc-simple-menu--open-from-bottom-left';
										default:
											return 'mdc-simple-menu--open-from-bottom-right';
									}
								}()),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$css,
									'transform',
									A2(
										_elm_lang$core$Basics_ops['++'],
										'scale(',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(model.scaleX),
											A2(
												_elm_lang$core$Basics_ops['++'],
												',',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_elm_lang$core$Basics$toString(model.scaleY),
													')'))))),
								_1: {
									ctor: '::',
									_0: A2(_aforemny$ncms$Material_Options$css, 'position', 'absolute'),
									_1: {
										ctor: '::',
										_0: A2(_aforemny$ncms$Material_Options$css, position.horizontal, '0'),
										_1: {
											ctor: '::',
											_0: A2(_aforemny$ncms$Material_Options$css, position.vertical, '0'),
											_1: {
												ctor: '::',
												_0: A2(_aforemny$ncms$Material_Options$css, 'transform-origin', transformOrigin),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					ul.node,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-simple-menu__items'),
						_1: {
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Options$css,
								'transform',
								A2(
									_elm_lang$core$Basics_ops['++'],
									'scale(',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(model.invScaleX),
										A2(
											_elm_lang$core$Basics_ops['++'],
											',',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(model.invScaleY),
												')'))))),
							_1: ul.options
						}
					},
					model.open ? A2(
						_elm_lang$core$List$indexedMap,
						F2(
							function (i, _p16) {
								var _p17 = _p16;
								var _p18 = _p17._0;
								return A2(
									_p18.node,
									{
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$css,
											'transition-delay',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(
													A2(transitionDelay, i, _p17._1)),
												's')),
										_1: _p18.options
									},
									_p18.childs);
							}),
						A3(
							_elm_lang$core$List$map2,
							F2(
								function (v0, v1) {
									return {ctor: '_Tuple2', _0: v0, _1: v1};
								}),
							ul.items,
							geometry.itemGeometries)) : A2(
						_elm_lang$core$List$map,
						function (item) {
							return A2(item.node, item.options, item.childs);
						},
						ul.items)),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Menu$render = A3(_aforemny$ncms$Material_Component$render, _aforemny$ncms$Material_Menu$get, _aforemny$ncms$Material_Menu$view, _aforemny$ncms$Material_Msg$MenuMsg);

var _aforemny$ncms$Material_Radio$name = function (value) {
	return _aforemny$ncms$Material_Internal_Options$attribute(
		_elm_lang$html$Html_Attributes$name(value));
};
var _aforemny$ncms$Material_Radio$selected = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{value: true});
	});
var _aforemny$ncms$Material_Radio$disabled = _aforemny$ncms$Material_Options$many(
	{
		ctor: '::',
		_0: _aforemny$ncms$Material_Options$cs('mdc-radio--disabled'),
		_1: {
			ctor: '::',
			_0: _aforemny$ncms$Material_Internal_Options$input(
				{
					ctor: '::',
					_0: _aforemny$ncms$Material_Internal_Options$attribute(
						_elm_lang$html$Html_Attributes$disabled(true)),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		}
	});
var _aforemny$ncms$Material_Radio$defaultConfig = {
	input: {ctor: '[]'},
	container: {ctor: '[]'},
	value: false
};
var _aforemny$ncms$Material_Radio$view = F4(
	function (lift, model, options, _p0) {
		var _p1 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Radio$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		return A4(
			_aforemny$ncms$Material_Internal_Options$applyContainer,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-radio'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Internal_Options$attribute(
						_aforemny$ncms$Material_Helpers$blurOn('mouseup')),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A4(
					_aforemny$ncms$Material_Internal_Options$applyInput,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-radio__native-control'),
						_1: {
							ctor: '::',
							_0: _aforemny$ncms$Material_Internal_Options$attribute(
								_elm_lang$html$Html_Attributes$type_('radio')),
							_1: {
								ctor: '::',
								_0: _aforemny$ncms$Material_Internal_Options$attribute(
									_elm_lang$html$Html_Attributes$checked(config.value)),
								_1: {
									ctor: '::',
									_0: A3(
										_aforemny$ncms$Material_Internal_Options$on1,
										'focus',
										lift,
										_aforemny$ncms$Material_Internal_Radio$SetFocus(true)),
									_1: {
										ctor: '::',
										_0: A3(
											_aforemny$ncms$Material_Internal_Options$on1,
											'blur',
											lift,
											_aforemny$ncms$Material_Internal_Radio$SetFocus(false)),
										_1: {
											ctor: '::',
											_0: A3(
												_aforemny$ncms$Material_Options$onWithOptions,
												'click',
												{preventDefault: true, stopPropagation: false},
												_elm_lang$core$Json_Decode$succeed(
													lift(_aforemny$ncms$Material_Internal_Radio$NoOp))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-radio__background'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A3(
								_aforemny$ncms$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-radio__inner-circle'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A3(
									_aforemny$ncms$Material_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _aforemny$ncms$Material_Options$cs('mdc-radio__outer-circle'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _aforemny$ncms$Material_Radio$update = F3(
	function (_p2, msg, model) {
		var _p3 = msg;
		if (_p3.ctor === 'SetFocus') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					_elm_lang$core$Native_Utils.update(
						model,
						{isFocused: _p3._0})),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _aforemny$ncms$Material_Radio$defaultModel = {isFocused: false};
var _aforemny$ncms$Material_Radio$_p4 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.radio;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{radio: x});
		}),
	_aforemny$ncms$Material_Radio$defaultModel);
var _aforemny$ncms$Material_Radio$get = _aforemny$ncms$Material_Radio$_p4._0;
var _aforemny$ncms$Material_Radio$set = _aforemny$ncms$Material_Radio$_p4._1;
var _aforemny$ncms$Material_Radio$react = A4(_aforemny$ncms$Material_Component$react, _aforemny$ncms$Material_Radio$get, _aforemny$ncms$Material_Radio$set, _aforemny$ncms$Material_Msg$RadioMsg, _aforemny$ncms$Material_Radio$update);
var _aforemny$ncms$Material_Radio$render = F4(
	function (lift, index, store, options) {
		return A7(
			_aforemny$ncms$Material_Component$render,
			_aforemny$ncms$Material_Radio$get,
			_aforemny$ncms$Material_Radio$view,
			_aforemny$ncms$Material_Msg$RadioMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$dispatch(lift),
				_1: options
			});
	});
var _aforemny$ncms$Material_Radio$Model = function (a) {
	return {isFocused: a};
};
var _aforemny$ncms$Material_Radio$Config = F3(
	function (a, b, c) {
		return {input: a, container: b, value: c};
	});

var _aforemny$ncms$Material_Ripple$decodeGeometry = function (type_) {
	return A4(
		_elm_lang$core$Json_Decode$map3,
		F3(
			function (isSurfaceDisabled, event, frame) {
				return {isSurfaceDisabled: isSurfaceDisabled, event: event, frame: frame};
			}),
		_debois$elm_dom$DOM$target(
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Json_Decode$map,
						_elm_lang$core$Basics$always(true),
						A2(
							_elm_lang$core$Json_Decode$at,
							{
								ctor: '::',
								_0: 'disabled',
								_1: {ctor: '[]'}
							},
							_elm_lang$core$Json_Decode$string)),
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Json_Decode$succeed(false),
						_1: {ctor: '[]'}
					}
				})),
		A3(
			_elm_lang$core$Json_Decode$map2,
			F2(
				function (pageX, pageY) {
					return {type_: type_, pageX: pageX, pageY: pageY};
				}),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'pageX',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float),
			A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'pageY',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float)),
		_debois$elm_dom$DOM$target(_debois$elm_dom$DOM$boundingClientRect));
};
var _aforemny$ncms$Material_Ripple$primary = _aforemny$ncms$Material_Options$cs('mdc-ripple-surface--primary');
var _aforemny$ncms$Material_Ripple$accent = _aforemny$ncms$Material_Options$cs('mdc-ripple-surface--accent');
var _aforemny$ncms$Material_Ripple$update = F2(
	function (msg, model) {
		var _p0 = msg;
		switch (_p0.ctor) {
			case 'Focus':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							focus: true,
							geometry: model.activated ? model.geometry : _p0._0
						}),
					{ctor: '[]'});
			case 'Blur':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{focus: false}),
					{ctor: '[]'});
			case 'Activate':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{activated: true, geometry: _p0._0}),
					{ctor: '[]'});
			default:
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{activated: false, focus: false}),
					{ctor: '[]'});
		}
	});
var _aforemny$ncms$Material_Ripple$defaultModel = {focus: false, activated: false, geometry: _aforemny$ncms$Material_Internal_Ripple$defaultGeometry};
var _aforemny$ncms$Material_Ripple$view = F4(
	function (isUnbounded, lift_, index, store) {
		var model = A2(
			_elm_lang$core$Maybe$withDefault,
			_aforemny$ncms$Material_Ripple$defaultModel,
			A2(_elm_lang$core$Dict$get, index, store.ripple));
		var geometry = model.geometry;
		var surfaceWidth = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(geometry.frame.width),
			'px');
		var surfaceHeight = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(geometry.frame.height),
			'px');
		var surfaceDiameter = _elm_lang$core$Basics$sqrt(
			Math.pow(geometry.frame.width, 2) + Math.pow(geometry.frame.height, 2));
		var maxRadius = surfaceDiameter + 10;
		var maxDimension = A2(_elm_lang$core$Basics$max, geometry.frame.width, geometry.frame.height);
		var initialSize = maxDimension * 0.6;
		var fgSize = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(initialSize),
			'px');
		var fgScale = _elm_lang$core$Basics$toString(maxRadius / initialSize);
		var endPoint = {x: (geometry.frame.width - initialSize) / 2, y: (geometry.frame.height - initialSize) / 2};
		var translateEnd = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(endPoint.x),
			A2(
				_elm_lang$core$Basics_ops['++'],
				'px, ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(endPoint.y),
					'px')));
		var wasActivatedByPointer = A2(
			_elm_lang$core$List$member,
			geometry.event.type_,
			{
				ctor: '::',
				_0: 'mousedown',
				_1: {
					ctor: '::',
					_0: 'touchstart',
					_1: {
						ctor: '::',
						_0: 'pointerdown',
						_1: {ctor: '[]'}
					}
				}
			});
		var startPoint = (wasActivatedByPointer && (!isUnbounded)) ? {x: (geometry.event.pageX - geometry.frame.left) - (initialSize / 2), y: (geometry.event.pageY - geometry.frame.top) - (initialSize / 2)} : {x: (geometry.frame.width - initialSize) / 2, y: (geometry.frame.height - initialSize) / 2};
		var translateStart = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(startPoint.x),
			A2(
				_elm_lang$core$Basics_ops['++'],
				'px, ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(startPoint.y),
					'px')));
		var top = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(startPoint.y),
			'px');
		var left = A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(startPoint.x),
			'px');
		var summary = A2(
			_aforemny$ncms$Material_Internal_Options$collect,
			{ctor: '_Tuple0'},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: {
						ctor: '::',
						_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-surface-width', surfaceWidth),
						_1: {
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-surface-height', surfaceHeight),
							_1: {
								ctor: '::',
								_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-fg-size', fgSize),
								_1: {
									ctor: '::',
									_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-fg-scale', fgScale),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					_1: {
						ctor: '::',
						_0: isUnbounded ? {
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-top', top),
							_1: {
								ctor: '::',
								_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-left', left),
								_1: {ctor: '[]'}
							}
						} : {
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-fg-translate-start', translateStart),
							_1: {
								ctor: '::',
								_0: A2(_aforemny$ncms$Material_Internal_Options$variable, '--mdc-ripple-fg-translate-end', translateEnd),
								_1: {ctor: '[]'}
							}
						},
						_1: {ctor: '[]'}
					}
				}));
		var _p1 = _aforemny$ncms$Material_Internal_Options$cssVariables(summary);
		var selector = _p1._0;
		var styleNode = _p1._1;
		var lift = function (_p2) {
			return lift_(
				A2(_aforemny$ncms$Material_Msg$RippleMsg, index, _p2));
		};
		return {
			ctor: '_Tuple2',
			_0: _aforemny$ncms$Material_Options$many(
				{
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Options$on,
						'focus',
						A2(
							_elm_lang$core$Json_Decode$map,
							function (_p3) {
								return lift(
									_aforemny$ncms$Material_Internal_Ripple$Focus(_p3));
							},
							_aforemny$ncms$Material_Ripple$decodeGeometry('focus'))),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$on,
							'blur',
							_elm_lang$core$Json_Decode$succeed(
								lift(_aforemny$ncms$Material_Internal_Ripple$Blur))),
						_1: {
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Options$on,
								'keydown',
								A2(
									_elm_lang$core$Json_Decode$map,
									function (_p4) {
										return lift(
											_aforemny$ncms$Material_Internal_Ripple$Activate(_p4));
									},
									_aforemny$ncms$Material_Ripple$decodeGeometry('keydown'))),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$on,
									'keyup',
									_elm_lang$core$Json_Decode$succeed(
										lift(_aforemny$ncms$Material_Internal_Ripple$Deactivate))),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Options$on,
										'mousedown',
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p5) {
												return lift(
													_aforemny$ncms$Material_Internal_Ripple$Activate(_p5));
											},
											_aforemny$ncms$Material_Ripple$decodeGeometry('mousedown'))),
									_1: {
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$on,
											'mouseup',
											_elm_lang$core$Json_Decode$succeed(
												lift(_aforemny$ncms$Material_Internal_Ripple$Deactivate))),
										_1: {
											ctor: '::',
											_0: A2(
												_aforemny$ncms$Material_Options$on,
												'pointerdown',
												A2(
													_elm_lang$core$Json_Decode$map,
													function (_p6) {
														return lift(
															_aforemny$ncms$Material_Internal_Ripple$Activate(_p6));
													},
													_aforemny$ncms$Material_Ripple$decodeGeometry('pointerdown'))),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_Options$on,
													'pointerup',
													_elm_lang$core$Json_Decode$succeed(
														lift(_aforemny$ncms$Material_Internal_Ripple$Deactivate))),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_Options$on,
														'touchstart',
														A2(
															_elm_lang$core$Json_Decode$map,
															function (_p7) {
																return lift(
																	_aforemny$ncms$Material_Internal_Ripple$Activate(_p7));
															},
															_aforemny$ncms$Material_Ripple$decodeGeometry('touchstart'))),
													_1: {
														ctor: '::',
														_0: A2(
															_aforemny$ncms$Material_Options$on,
															'touchend',
															_elm_lang$core$Json_Decode$succeed(
																lift(_aforemny$ncms$Material_Internal_Ripple$Deactivate))),
														_1: {
															ctor: '::',
															_0: _aforemny$ncms$Material_Options$cs('mdc-ripple-surface'),
															_1: {
																ctor: '::',
																_0: _aforemny$ncms$Material_Options$cs('mdc-ripple-upgraded'),
																_1: {
																	ctor: '::',
																	_0: _aforemny$ncms$Material_Options$attribute(
																		_elm_lang$html$Html_Attributes$tabindex(0)),
																	_1: {
																		ctor: '::',
																		_0: function (_p8) {
																			return A2(
																				_aforemny$ncms$Material_Options$when,
																				isUnbounded,
																				_aforemny$ncms$Material_Options$many(_p8));
																		}(
																			{
																				ctor: '::',
																				_0: _aforemny$ncms$Material_Options$cs('mdc-ripple-upgraded--unbounded'),
																				_1: {
																					ctor: '::',
																					_0: A2(_aforemny$ncms$Material_Options$css, 'overflow', 'visible'),
																					_1: {
																						ctor: '::',
																						_0: A2(_aforemny$ncms$Material_Options$data, 'data-mdc-ripple-is-unbounded', ''),
																						_1: {ctor: '[]'}
																					}
																				}
																			}),
																		_1: {
																			ctor: '::',
																			_0: function (_p9) {
																				return A2(
																					_aforemny$ncms$Material_Options$when,
																					model.activated,
																					_aforemny$ncms$Material_Options$many(_p9));
																			}(
																				{
																					ctor: '::',
																					_0: _aforemny$ncms$Material_Options$cs('mdc-ripple-upgraded--background-active-fill'),
																					_1: {
																						ctor: '::',
																						_0: _aforemny$ncms$Material_Options$cs('mdc-ripple-upgraded--foreground-activation'),
																						_1: {ctor: '[]'}
																					}
																				}),
																			_1: {
																				ctor: '::',
																				_0: A2(
																					_aforemny$ncms$Material_Options$when,
																					model.focus,
																					_aforemny$ncms$Material_Options$cs('mdc-ripple-upgraded--background-focused')),
																				_1: {
																					ctor: '::',
																					_0: _aforemny$ncms$Material_Options$cs(selector),
																					_1: {ctor: '[]'}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}),
			_1: styleNode
		};
	});
var _aforemny$ncms$Material_Ripple$bounded = F3(
	function (lift_, index, store) {
		return A4(_aforemny$ncms$Material_Ripple$view, false, lift_, index, store);
	});
var _aforemny$ncms$Material_Ripple$unbounded = F3(
	function (lift_, index, store) {
		return A4(_aforemny$ncms$Material_Ripple$view, true, lift_, index, store);
	});
var _aforemny$ncms$Material_Ripple$_p10 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.ripple;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{ripple: x});
		}),
	_aforemny$ncms$Material_Ripple$defaultModel);
var _aforemny$ncms$Material_Ripple$get = _aforemny$ncms$Material_Ripple$_p10._0;
var _aforemny$ncms$Material_Ripple$set = _aforemny$ncms$Material_Ripple$_p10._1;
var _aforemny$ncms$Material_Ripple$react = A4(
	_aforemny$ncms$Material_Component$react,
	_aforemny$ncms$Material_Ripple$get,
	_aforemny$ncms$Material_Ripple$set,
	_aforemny$ncms$Material_Msg$RippleMsg,
	_aforemny$ncms$Material_Component$generalise(_aforemny$ncms$Material_Ripple$update));
var _aforemny$ncms$Material_Ripple$Model = F3(
	function (a, b, c) {
		return {focus: a, activated: b, geometry: c};
	});

var _aforemny$ncms$Material_Icon$view = F2(
	function (name, options) {
		return A3(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$i,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('material-icons'),
				_1: options
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(name),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Icon$i = function (name) {
	return A2(
		_aforemny$ncms$Material_Icon$view,
		name,
		{ctor: '[]'});
};
var _aforemny$ncms$Material_Icon$size48 = A2(_aforemny$ncms$Material_Options$css, 'font-size', '48px');
var _aforemny$ncms$Material_Icon$size36 = A2(_aforemny$ncms$Material_Options$css, 'font-size', '36px');
var _aforemny$ncms$Material_Icon$size24 = A2(_aforemny$ncms$Material_Options$css, 'font-size', '24px');
var _aforemny$ncms$Material_Icon$size18 = A2(_aforemny$ncms$Material_Options$css, 'font-size', '18px');
var _aforemny$ncms$Material_Icon$defaultConfig = {};
var _aforemny$ncms$Material_Icon$Config = {};

var _aforemny$ncms$Material_List$subheader = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list-group__subheader'),
			_1: options
		});
};
var _aforemny$ncms$Material_List$group = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list-group'),
			_1: options
		});
};
var _aforemny$ncms$Material_List$inset = _aforemny$ncms$Material_Options$cs('mdc-list-divider--inset');
var _aforemny$ncms$Material_List$divider = F2(
	function (options, _p0) {
		return A3(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$hr,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-list-divider'),
				_1: options
			},
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_List$secondary = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list-item__text__secondary'),
			_1: options
		});
};
var _aforemny$ncms$Material_List$text = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list-item__text'),
			_1: options
		});
};
var _aforemny$ncms$Material_List$avatarImage = F2(
	function (src, options) {
		return A4(
			_aforemny$ncms$Material_Options$styled_,
			_elm_lang$html$Html$img,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-list-item__start-detail'),
				_1: options
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$src(src),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_List$endDetailIcon = F2(
	function (icon, options) {
		return A2(
			_aforemny$ncms$Material_Icon$view,
			icon,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-list-item__end-detail'),
				_1: options
			});
	});
var _aforemny$ncms$Material_List$endDetail = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list-item__end-detail'),
			_1: options
		});
};
var _aforemny$ncms$Material_List$startDetailIcon = F2(
	function (icon, options) {
		return A2(
			_aforemny$ncms$Material_Icon$view,
			icon,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-list-item__start-detail'),
				_1: options
			});
	});
var _aforemny$ncms$Material_List$startDetail = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list-item__start-detail'),
			_1: options
		});
};
var _aforemny$ncms$Material_List$li = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$li,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list-item'),
			_1: options
		});
};
var _aforemny$ncms$Material_List$twoLine = _aforemny$ncms$Material_Options$cs('mdc-list--two-line');
var _aforemny$ncms$Material_List$avatar = _aforemny$ncms$Material_Options$cs('mdc-list--avatar-list');
var _aforemny$ncms$Material_List$dense = _aforemny$ncms$Material_Options$cs('mdc-list--dense');
var _aforemny$ncms$Material_List$ul = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$ul,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-list'),
			_1: options
		});
};

var _aforemny$ncms$Material_Select$decodeGeometry = _debois$elm_dom$DOM$target(
	A2(_debois$elm_dom$DOM$childNode, 1, _aforemny$ncms$Material_Menu$decodeGeometry));
var _aforemny$ncms$Material_Select$disabled = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _aforemny$ncms$Material_Select$index = function (_p0) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (index, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						index: _elm_lang$core$Maybe$Just(index)
					});
			})(_p0));
};
var _aforemny$ncms$Material_Select$selectedText = function (_p1) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{selectedText: value});
			})(_p1));
};
var _aforemny$ncms$Material_Select$defaultConfig = {index: _elm_lang$core$Maybe$Nothing, selectedText: '', disabled: false};
var _aforemny$ncms$Material_Select$view = F4(
	function (lift, model, options, items) {
		var geometry = A2(_elm_lang$core$Maybe$withDefault, _aforemny$ncms$Material_Internal_Menu$defaultGeometry, model.menu.geometry);
		var left = geometry.anchor.left;
		var top = geometry.anchor.top;
		var _p2 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Select$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		var itemOffsetTop = A2(
			_elm_lang$core$Maybe$withDefault,
			0,
			A2(
				_elm_lang$core$Maybe$map,
				function (_) {
					return _.top;
				},
				_elm_lang$core$List$head(
					A2(
						_elm_lang$core$List$drop,
						A2(_elm_lang$core$Maybe$withDefault, 0, config.index),
						geometry.itemGeometries))));
		var adjustedTop = function () {
			var adjustedTop_ = top - itemOffsetTop;
			var overflowsTop = _elm_lang$core$Native_Utils.cmp(adjustedTop_, 0) < 0;
			var overflowsBottom = _elm_lang$core$Native_Utils.cmp(adjustedTop_ + geometry.itemsContainer.height, geometry.window.height) > 0;
			return overflowsTop ? 0 : (overflowsBottom ? A2(_elm_lang$core$Basics$max, 0, geometry.window.height - geometry.itemsContainer.height) : adjustedTop_);
		}();
		var transformOrigin = A2(
			_elm_lang$core$Basics_ops['++'],
			'center ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(itemOffsetTop),
				'px'));
		return A5(
			_aforemny$ncms$Material_Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-select'),
				_1: {
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Options$when,
						model.menu.open,
						_aforemny$ncms$Material_Options$cs('mdc-select--open')),
					_1: {
						ctor: '::',
						_0: A2(_aforemny$ncms$Material_Options$css, 'width', '439px'),
						_1: {
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Options$when,
								!config.disabled,
								A2(
									_aforemny$ncms$Material_Options$on,
									'click',
									A2(
										_elm_lang$core$Json_Decode$map,
										function (_p3) {
											return lift(
												_aforemny$ncms$Material_Internal_Select$MenuMsg(
													_aforemny$ncms$Material_Internal_Menu$Toggle(_p3)));
										},
										_aforemny$ncms$Material_Select$decodeGeometry))),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'listbox'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$tabindex(0),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A3(
					_aforemny$ncms$Material_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-select__selected-text'),
						_1: {
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Options$css, 'pointer-events', 'none'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(config.selectedText),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A4(
						_aforemny$ncms$Material_Menu$view,
						function (_p4) {
							return lift(
								_aforemny$ncms$Material_Internal_Select$MenuMsg(_p4));
						},
						model.menu,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-select__menu'),
							_1: {
								ctor: '::',
								_0: A2(_aforemny$ncms$Material_Options$css, 'bottom', 'auto'),
								_1: {
									ctor: '::',
									_0: A2(_aforemny$ncms$Material_Options$css, 'right', 'auto'),
									_1: {
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$css,
											'left',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(left),
												'px')),
										_1: {
											ctor: '::',
											_0: A2(
												_aforemny$ncms$Material_Options$css,
												'top',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_elm_lang$core$Basics$toString(adjustedTop),
													'px')),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_Options$css,
													'transform-origin',
													A2(
														_elm_lang$core$Basics_ops['++'],
														'center ',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_elm_lang$core$Basics$toString(transformOrigin),
															'px'))),
												_1: {
													ctor: '::',
													_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'block'),
													_1: {
														ctor: '::',
														_0: _aforemny$ncms$Material_Menu$index(
															A2(_elm_lang$core$Maybe$withDefault, 0, config.index)),
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						},
						A3(
							_aforemny$ncms$Material_Menu$ul,
							_aforemny$ncms$Material_List$ul,
							{ctor: '[]'},
							items)),
					_1: {ctor: '[]'}
				}
			});
	});
var _aforemny$ncms$Material_Select$update = F3(
	function (fwd, msg, model) {
		var _p5 = msg;
		var _p6 = A3(
			_aforemny$ncms$Material_Menu$update,
			function (_p7) {
				return fwd(
					_aforemny$ncms$Material_Internal_Select$MenuMsg(_p7));
			},
			_p5._0,
			model.menu);
		var menu = _p6._0;
		var menuCmd = _p6._1;
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			_elm_lang$core$Native_Utils.update(
				model,
				{menu: menu}),
			{
				ctor: '::',
				_0: menuCmd,
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Select$defaultModel = {menu: _aforemny$ncms$Material_Menu$defaultModel};
var _aforemny$ncms$Material_Select$_p8 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.select;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{select: x});
		}),
	_aforemny$ncms$Material_Select$defaultModel);
var _aforemny$ncms$Material_Select$get = _aforemny$ncms$Material_Select$_p8._0;
var _aforemny$ncms$Material_Select$set = _aforemny$ncms$Material_Select$_p8._1;
var _aforemny$ncms$Material_Select$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			function (_p9) {
				return _elm_lang$core$Maybe$Just(
					A3(_aforemny$ncms$Material_Select$set, idx, store, _p9));
			},
			A3(
				_aforemny$ncms$Material_Select$update,
				lift,
				msg,
				A2(_aforemny$ncms$Material_Select$get, idx, store)));
	});
var _aforemny$ncms$Material_Select$render = F4(
	function (lift, index, store, options) {
		return A7(
			_aforemny$ncms$Material_Component$render,
			_aforemny$ncms$Material_Select$get,
			_aforemny$ncms$Material_Select$view,
			_aforemny$ncms$Material_Msg$SelectMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$dispatch(lift),
				_1: options
			});
	});
var _aforemny$ncms$Material_Select$subscriptions = function (model) {
	return A2(
		_elm_lang$core$Platform_Sub$map,
		_aforemny$ncms$Material_Internal_Select$MenuMsg,
		_aforemny$ncms$Material_Menu$subscriptions(model.menu));
};
var _aforemny$ncms$Material_Select$subs = A3(
	_aforemny$ncms$Material_Component$subs,
	_aforemny$ncms$Material_Msg$SelectMsg,
	function (_) {
		return _.select;
	},
	_aforemny$ncms$Material_Select$subscriptions);
var _aforemny$ncms$Material_Select$Model = function (a) {
	return {menu: a};
};
var _aforemny$ncms$Material_Select$Config = F3(
	function (a, b, c) {
		return {index: a, selectedText: b, disabled: c};
	});

var _aforemny$ncms$Material_Slider$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$none;
};
var _aforemny$ncms$Material_Slider$subs = A3(
	_aforemny$ncms$Material_Component$subs,
	_aforemny$ncms$Material_Msg$SliderMsg,
	function (_) {
		return _.slider;
	},
	_aforemny$ncms$Material_Slider$subscriptions);
var _aforemny$ncms$Material_Slider$trackMarkers = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{trackMarkers: true});
	});
var _aforemny$ncms$Material_Slider$steps = function (_p0) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (steps, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{steps: steps});
			})(_p0));
};
var _aforemny$ncms$Material_Slider$onInput = function (_p1) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (decoder, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						onInput: _elm_lang$core$Maybe$Just(decoder)
					});
			})(_p1));
};
var _aforemny$ncms$Material_Slider$onChange = function (_p2) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (decoder, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						onChange: _elm_lang$core$Maybe$Just(decoder)
					});
			})(_p2));
};
var _aforemny$ncms$Material_Slider$hasClass = function ($class) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		function (className) {
			return A2(
				_elm_lang$core$String$contains,
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					A2(_elm_lang$core$Basics_ops['++'], $class, ' ')),
				A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					A2(_elm_lang$core$Basics_ops['++'], className, ' ')));
		},
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'className',
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Json_Decode$string));
};
var _aforemny$ncms$Material_Slider$traverseToContainer = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (doesHaveClass) {
			return doesHaveClass ? decoder : _debois$elm_dom$DOM$parentElement(
				_elm_lang$core$Json_Decode$lazy(
					function (_p3) {
						return _aforemny$ncms$Material_Slider$traverseToContainer(decoder);
					}));
		},
		_aforemny$ncms$Material_Slider$hasClass('mdc-slider'));
};
var _aforemny$ncms$Material_Slider$data = F2(
	function (key, decoder) {
		return A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'dataset',
				_1: {
					ctor: '::',
					_0: key,
					_1: {ctor: '[]'}
				}
			},
			decoder);
	});
var _aforemny$ncms$Material_Slider$decodeGeometry = A2(
	_elm_lang$core$Json_Decode$andThen,
	function (x) {
		return _debois$elm_dom$DOM$target(
			_aforemny$ncms$Material_Slider$traverseToContainer(
				A7(
					_elm_lang$core$Json_Decode$map6,
					F6(
						function (offsetWidth, offsetLeft, discrete, min, max, steps) {
							return {width: offsetWidth, left: offsetLeft, x: x, discrete: discrete, min: min, max: max, steps: steps};
						}),
					_debois$elm_dom$DOM$offsetWidth,
					_debois$elm_dom$DOM$offsetLeft,
					_aforemny$ncms$Material_Slider$hasClass('mdc-slider--discrete'),
					A2(
						_aforemny$ncms$Material_Slider$data,
						'min',
						A2(
							_elm_lang$core$Json_Decode$map,
							function (_p4) {
								return A2(
									_elm_lang$core$Result$withDefault,
									1,
									_elm_lang$core$String$toFloat(_p4));
							},
							_elm_lang$core$Json_Decode$string)),
					A2(
						_aforemny$ncms$Material_Slider$data,
						'max',
						A2(
							_elm_lang$core$Json_Decode$map,
							function (_p5) {
								return A2(
									_elm_lang$core$Result$withDefault,
									1,
									_elm_lang$core$String$toFloat(_p5));
							},
							_elm_lang$core$Json_Decode$string)),
					A2(
						_aforemny$ncms$Material_Slider$data,
						'steps',
						A2(
							_elm_lang$core$Json_Decode$map,
							function (_p6) {
								return A2(
									_elm_lang$core$Result$withDefault,
									1,
									_elm_lang$core$String$toInt(_p6));
							},
							_elm_lang$core$Json_Decode$string)))));
	},
	_elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Json_Decode$at,
				{
					ctor: '::',
					_0: 'pageX',
					_1: {ctor: '[]'}
				},
				_elm_lang$core$Json_Decode$float),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Json_Decode$succeed(0),
				_1: {ctor: '[]'}
			}
		}));
var _aforemny$ncms$Material_Slider$computeValue = function (geometry) {
	var c = (!_elm_lang$core$Native_Utils.eq(geometry.width, 0)) ? ((geometry.x - geometry.left) / geometry.width) : A3(_elm_lang$core$Basics$clamp, 0, 1, 0);
	return A3(_elm_lang$core$Basics$clamp, geometry.min, geometry.max, geometry.min + (c * (geometry.max - geometry.min)));
};
var _aforemny$ncms$Material_Slider$discretize = F2(
	function (steps, continuousValue) {
		return _elm_lang$core$Basics$toFloat(
			steps * _elm_lang$core$Basics$round(
				continuousValue / _elm_lang$core$Basics$toFloat(steps)));
	});
var _aforemny$ncms$Material_Slider$targetValue = A2(
	_elm_lang$core$Json_Decode$map,
	function (geometry) {
		return geometry.discrete ? A2(
			_aforemny$ncms$Material_Slider$discretize,
			geometry.steps,
			_aforemny$ncms$Material_Slider$computeValue(geometry)) : _aforemny$ncms$Material_Slider$computeValue(geometry);
	},
	_aforemny$ncms$Material_Slider$decodeGeometry);
var _aforemny$ncms$Material_Slider$disabled = _aforemny$ncms$Material_Options$many(
	{
		ctor: '::',
		_0: _aforemny$ncms$Material_Options$cs('mdc-slider--disabled'),
		_1: {
			ctor: '::',
			_0: _aforemny$ncms$Material_Internal_Options$attribute(
				_elm_lang$html$Html_Attributes$disabled(true)),
			_1: {ctor: '[]'}
		}
	});
var _aforemny$ncms$Material_Slider$discrete = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{discrete: true});
	});
var _aforemny$ncms$Material_Slider$max = function (_p7) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (max, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						max: _elm_lang$core$Basics$toFloat(max)
					});
			})(_p7));
};
var _aforemny$ncms$Material_Slider$min = function (_p8) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (min, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						min: _elm_lang$core$Basics$toFloat(min)
					});
			})(_p8));
};
var _aforemny$ncms$Material_Slider$value = function (_p9) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{value: value});
			})(_p9));
};
var _aforemny$ncms$Material_Slider$defaultConfig = {value: 0, min: 0, max: 100, steps: 1, discrete: false, onInput: _elm_lang$core$Maybe$Nothing, onChange: _elm_lang$core$Maybe$Nothing, trackMarkers: false};
var _aforemny$ncms$Material_Slider$view = F4(
	function (lift, model, options, _p10) {
		var activateOn_ = function (event) {
			return A3(
				_aforemny$ncms$Material_Options$onWithOptions,
				event,
				{stopPropagation: true, preventDefault: false},
				A2(
					_elm_lang$core$Json_Decode$map,
					function (_p11) {
						return lift(
							A2(_aforemny$ncms$Material_Internal_Slider$Activate, false, _p11));
					},
					_aforemny$ncms$Material_Slider$decodeGeometry));
		};
		var leaves = {
			ctor: '::',
			_0: 'mouseleave',
			_1: {
				ctor: '::',
				_0: 'touchleave',
				_1: {
					ctor: '::',
					_0: 'pointerleave',
					_1: {ctor: '[]'}
				}
			}
		};
		var moves = {
			ctor: '::',
			_0: 'mousemove',
			_1: {
				ctor: '::',
				_0: 'touchmove',
				_1: {
					ctor: '::',
					_0: 'pointermove',
					_1: {ctor: '[]'}
				}
			}
		};
		var downs = {
			ctor: '::',
			_0: 'mousedown',
			_1: {
				ctor: '::',
				_0: 'touchstart',
				_1: {
					ctor: '::',
					_0: 'keydown',
					_1: {
						ctor: '::',
						_0: 'pointerdown',
						_1: {ctor: '[]'}
					}
				}
			}
		};
		var ups = {
			ctor: '::',
			_0: 'mouseup',
			_1: {
				ctor: '::',
				_0: 'touchend',
				_1: {
					ctor: '::',
					_0: 'pointerup',
					_1: {ctor: '[]'}
				}
			}
		};
		var dragOn = function (event) {
			return A2(
				_aforemny$ncms$Material_Options$on,
				event,
				A2(
					_elm_lang$core$Json_Decode$map,
					function (_p12) {
						return lift(
							_aforemny$ncms$Material_Internal_Slider$Drag(_p12));
					},
					_aforemny$ncms$Material_Slider$decodeGeometry));
		};
		var upOn = function (event) {
			return A2(
				_aforemny$ncms$Material_Options$on,
				event,
				_elm_lang$core$Json_Decode$succeed(
					lift(_aforemny$ncms$Material_Internal_Slider$Up)));
		};
		var activateOn = function (event) {
			return A2(
				_aforemny$ncms$Material_Options$on,
				event,
				A2(
					_elm_lang$core$Json_Decode$map,
					function (_p13) {
						return lift(
							A2(_aforemny$ncms$Material_Internal_Slider$Activate, true, _p13));
					},
					_aforemny$ncms$Material_Slider$decodeGeometry));
		};
		var _p14 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Slider$defaultConfig, options);
		var summary = _p14;
		var config = _p14.config;
		var continuousValue = model.active ? A2(_elm_lang$core$Maybe$withDefault, config.value, model.value) : config.value;
		var value = config.discrete ? A2(_aforemny$ncms$Material_Slider$discretize, config.steps, continuousValue) : continuousValue;
		var translateX = function () {
			var v = A3(_elm_lang$core$Basics$clamp, config.min, config.max, value);
			var c = (!_elm_lang$core$Native_Utils.eq(config.max - config.min, 0)) ? A3(_elm_lang$core$Basics$clamp, 0, 1, (v - config.min) / (config.max - config.min)) : 0;
			return A2(
				_elm_lang$core$Maybe$withDefault,
				0,
				A2(
					_elm_lang$core$Maybe$map,
					F2(
						function (x, y) {
							return x * y;
						})(c),
					A2(
						_elm_lang$core$Maybe$map,
						function (_) {
							return _.width;
						},
						model.geometry)));
		}();
		var inputOn = function (event) {
			return A2(
				_aforemny$ncms$Material_Options$on,
				event,
				A2(
					_elm_lang$core$Maybe$withDefault,
					_elm_lang$core$Json_Decode$succeed(
						lift(_aforemny$ncms$Material_Internal_Slider$NoOp)),
					config.onInput));
		};
		var changeOn = function (event) {
			return A2(
				_aforemny$ncms$Material_Options$on,
				event,
				A2(
					_elm_lang$core$Maybe$withDefault,
					_elm_lang$core$Json_Decode$succeed(
						lift(_aforemny$ncms$Material_Internal_Slider$NoOp)),
					config.onChange));
		};
		var trackScale = _elm_lang$core$Native_Utils.eq(config.max - config.min, 0) ? 0 : ((value - config.min) / (config.max - config.min));
		return A5(
			_aforemny$ncms$Material_Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-slider'),
				_1: {
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Options$when,
						model.focus,
						_aforemny$ncms$Material_Options$cs('mdc-slider--focus')),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$when,
							model.active,
							_aforemny$ncms$Material_Options$cs('mdc-slider--active')),
						_1: {
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Options$when,
								_elm_lang$core$Native_Utils.cmp(value, config.min) < 1,
								_aforemny$ncms$Material_Options$cs('mdc-slider--off')),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$when,
									config.discrete,
									_aforemny$ncms$Material_Options$cs('mdc-slider--discrete')),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Options$when,
										model.inTransit,
										_aforemny$ncms$Material_Options$cs('mdc-slider--in-transit')),
									_1: {
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$when,
											config.trackMarkers,
											_aforemny$ncms$Material_Options$cs('mdc-slider--display-markers')),
										_1: {
											ctor: '::',
											_0: _aforemny$ncms$Material_Options$attribute(
												_elm_lang$html$Html_Attributes$tabindex(0)),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_Options$on,
													'focus',
													_elm_lang$core$Json_Decode$succeed(
														lift(_aforemny$ncms$Material_Internal_Slider$Focus))),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_Options$on,
														'blur',
														_elm_lang$core$Json_Decode$succeed(
															lift(_aforemny$ncms$Material_Internal_Slider$Blur))),
													_1: {
														ctor: '::',
														_0: A2(
															_aforemny$ncms$Material_Options$data,
															'min',
															_elm_lang$core$Basics$toString(config.min)),
														_1: {
															ctor: '::',
															_0: A2(
																_aforemny$ncms$Material_Options$data,
																'max',
																_elm_lang$core$Basics$toString(config.max)),
															_1: {
																ctor: '::',
																_0: A2(
																	_aforemny$ncms$Material_Options$data,
																	'steps',
																	_elm_lang$core$Basics$toString(config.steps)),
																_1: {
																	ctor: '::',
																	_0: _aforemny$ncms$Material_Options$many(
																		A2(_elm_lang$core$List$map, activateOn, downs)),
																	_1: {
																		ctor: '::',
																		_0: _aforemny$ncms$Material_Options$many(
																			A2(
																				_elm_lang$core$List$map,
																				upOn,
																				_elm_lang$core$List$concat(
																					{
																						ctor: '::',
																						_0: ups,
																						_1: {
																							ctor: '::',
																							_0: leaves,
																							_1: {
																								ctor: '::',
																								_0: {
																									ctor: '::',
																									_0: 'blur',
																									_1: {ctor: '[]'}
																								},
																								_1: {ctor: '[]'}
																							}
																						}
																					}))),
																		_1: {
																			ctor: '::',
																			_0: A2(
																				_aforemny$ncms$Material_Options$when,
																				!_elm_lang$core$Native_Utils.eq(config.onChange, _elm_lang$core$Maybe$Nothing),
																				_aforemny$ncms$Material_Options$many(
																					A2(_elm_lang$core$List$map, changeOn, ups))),
																			_1: {
																				ctor: '::',
																				_0: A2(
																					_aforemny$ncms$Material_Options$when,
																					model.active,
																					_aforemny$ncms$Material_Options$many(
																						A2(_elm_lang$core$List$map, dragOn, moves))),
																				_1: {
																					ctor: '::',
																					_0: A2(
																						_aforemny$ncms$Material_Options$when,
																						!_elm_lang$core$Native_Utils.eq(config.onInput, _elm_lang$core$Maybe$Nothing),
																						model.active ? _aforemny$ncms$Material_Options$many(
																							A2(
																								_elm_lang$core$List$map,
																								inputOn,
																								_elm_lang$core$List$concat(
																									{
																										ctor: '::',
																										_0: downs,
																										_1: {
																											ctor: '::',
																											_0: ups,
																											_1: {
																												ctor: '::',
																												_0: moves,
																												_1: {ctor: '[]'}
																											}
																										}
																									}))) : _aforemny$ncms$Material_Options$many(
																							A2(_elm_lang$core$List$map, inputOn, downs))),
																					_1: {ctor: '[]'}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_aforemny$ncms$Material_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-slider__track-container'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A3(
							_aforemny$ncms$Material_Options$styled,
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _aforemny$ncms$Material_Options$cs('mdc-slider__track'),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Options$css,
										'transform',
										A2(
											_elm_lang$core$Basics_ops['++'],
											'scaleX(',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(trackScale),
												')'))),
									_1: {ctor: '[]'}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A3(
								_aforemny$ncms$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-slider__track-marker-container'),
									_1: {ctor: '[]'}
								},
								A2(
									_elm_lang$core$List$repeat,
									(_elm_lang$core$Basics$round(config.max - config.min) / config.steps) | 0,
									A3(
										_aforemny$ncms$Material_Options$styled,
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _aforemny$ncms$Material_Options$cs('mdc-slider__track-marker'),
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}))),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-slider__thumb-container'),
							_1: {
								ctor: '::',
								_0: _aforemny$ncms$Material_Options$many(
									A2(_elm_lang$core$List$map, activateOn_, downs)),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Options$css,
										'transform',
										A2(
											_elm_lang$core$Basics_ops['++'],
											'translateX(',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(translateX),
												'px) translateX(-50%)'))),
									_1: {
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$on,
											'transitionend',
											A3(
												_elm_lang$core$Json_Decode$map2,
												F2(
													function (tick, onInput) {
														return lift(
															_aforemny$ncms$Material_Internal_Slider$Dispatch(
																{
																	ctor: '::',
																	_0: tick,
																	_1: {
																		ctor: '::',
																		_0: onInput,
																		_1: {ctor: '[]'}
																	}
																}));
													}),
												_elm_lang$core$Json_Decode$succeed(
													lift(_aforemny$ncms$Material_Internal_Slider$Tick)),
												A2(
													_elm_lang$core$Maybe$withDefault,
													_elm_lang$core$Json_Decode$succeed(
														lift(_aforemny$ncms$Material_Internal_Slider$NoOp)),
													config.onInput))),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$svg,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$class('mdc-slider__thumb'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$width('21'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$height('21'),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$svg$Svg$circle,
										{
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$cx('10.5'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$cy('10.5'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$r('7.875'),
													_1: {ctor: '[]'}
												}
											}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A3(
									_aforemny$ncms$Material_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _aforemny$ncms$Material_Options$cs('mdc-slider__focus-ring'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: A3(
										_aforemny$ncms$Material_Options$styled,
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _aforemny$ncms$Material_Options$cs('mdc-slider__pin'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A3(
												_aforemny$ncms$Material_Options$styled,
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: _aforemny$ncms$Material_Options$cs('mdc-slider__pin-value-marker'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(
														_elm_lang$core$Basics$toString(value)),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _aforemny$ncms$Material_Slider$update = F3(
	function (fwd, msg, model) {
		var _p15 = msg;
		switch (_p15.ctor) {
			case 'NoOp':
				return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'Dispatch':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$core$Platform_Cmd$batch(
						A2(_elm_lang$core$List$map, _aforemny$ncms$Material_Helpers$cmd, _p15._0))
				};
			case 'Focus':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{focus: true}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Blur':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{focus: false, active: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Tick':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{inTransit: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Activate':
				var _p16 = _p15._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							active: true,
							geometry: _elm_lang$core$Maybe$Just(_p16),
							inTransit: _p15._0,
							value: _elm_lang$core$Maybe$Just(
								_aforemny$ncms$Material_Slider$computeValue(_p16))
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Drag':
				var _p17 = _p15._0;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							geometry: _elm_lang$core$Maybe$Just(_p17),
							inTransit: false,
							value: _elm_lang$core$Maybe$Just(
								_aforemny$ncms$Material_Slider$computeValue(_p17))
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{active: false}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
		}
	});
var _aforemny$ncms$Material_Slider$defaultModel = {focus: false, active: false, geometry: _elm_lang$core$Maybe$Nothing, value: _elm_lang$core$Maybe$Nothing, inTransit: false};
var _aforemny$ncms$Material_Slider$_p18 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.slider;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{slider: x});
		}),
	_aforemny$ncms$Material_Slider$defaultModel);
var _aforemny$ncms$Material_Slider$get = _aforemny$ncms$Material_Slider$_p18._0;
var _aforemny$ncms$Material_Slider$set = _aforemny$ncms$Material_Slider$_p18._1;
var _aforemny$ncms$Material_Slider$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			function (_p19) {
				return _elm_lang$core$Maybe$Just(
					A3(_aforemny$ncms$Material_Slider$set, idx, store, _p19));
			},
			A3(
				_aforemny$ncms$Material_Slider$update,
				lift,
				msg,
				A2(_aforemny$ncms$Material_Slider$get, idx, store)));
	});
var _aforemny$ncms$Material_Slider$render = F4(
	function (lift, index, store, options) {
		return A7(
			_aforemny$ncms$Material_Component$render,
			_aforemny$ncms$Material_Slider$get,
			_aforemny$ncms$Material_Slider$view,
			_aforemny$ncms$Material_Msg$SliderMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$dispatch(lift),
				_1: options
			});
	});
var _aforemny$ncms$Material_Slider$Model = F5(
	function (a, b, c, d, e) {
		return {focus: a, active: b, geometry: c, value: d, inTransit: e};
	});
var _aforemny$ncms$Material_Slider$Config = F8(
	function (a, b, c, d, e, f, g, h) {
		return {value: a, min: b, max: c, discrete: d, steps: e, onInput: f, onChange: g, trackMarkers: h};
	});

var _aforemny$ncms$Material_Snackbar$alignEnd = _aforemny$ncms$Material_Options$cs('mdc-snackbar--align-end');
var _aforemny$ncms$Material_Snackbar$alignStart = _aforemny$ncms$Material_Options$cs('mdc-snackbar--align-start');
var _aforemny$ncms$Material_Snackbar$onDismiss = function (_p0) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (msg, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						onDismiss: _elm_lang$core$Maybe$Just(msg)
					});
			})(_p0));
};
var _aforemny$ncms$Material_Snackbar$defaultConfig = {onDismiss: _elm_lang$core$Maybe$Nothing};
var _aforemny$ncms$Material_Snackbar$view = F4(
	function (lift, model, options, _p1) {
		var _p2 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Snackbar$defaultConfig, options);
		var summary = _p2;
		var config = _p2.config;
		var isActive = function () {
			var _p3 = model.state;
			switch (_p3.ctor) {
				case 'Inert':
					return false;
				case 'Active':
					return true;
				default:
					return false;
			}
		}();
		var contents = function () {
			var _p4 = model.state;
			switch (_p4.ctor) {
				case 'Inert':
					return _elm_lang$core$Maybe$Nothing;
				case 'Active':
					return _elm_lang$core$Maybe$Just(_p4._0);
				default:
					return _elm_lang$core$Maybe$Just(_p4._0);
			}
		}();
		var action = A2(
			_elm_lang$core$Maybe$andThen,
			function (_) {
				return _.action;
			},
			contents);
		var multiline = _elm_lang$core$Native_Utils.eq(
			A2(
				_elm_lang$core$Maybe$map,
				function (_) {
					return _.multiline;
				},
				contents),
			_elm_lang$core$Maybe$Just(true));
		var actionOnBottom = _elm_lang$core$Native_Utils.eq(
			A2(
				_elm_lang$core$Maybe$map,
				function (_) {
					return _.actionOnBottom;
				},
				contents),
			_elm_lang$core$Maybe$Just(true)) && multiline;
		var dismissHandler = function () {
			var _p5 = {ctor: '_Tuple2', _0: contents, _1: config.onDismiss};
			if (((_p5.ctor === '_Tuple2') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) {
				return _aforemny$ncms$Material_Options$onClick(
					lift(
						A2(_aforemny$ncms$Material_Internal_Snackbar$Dismiss, _p5._0._0.dismissOnAction, config.onDismiss)));
			} else {
				return _aforemny$ncms$Material_Options$nop;
			}
		}();
		return A5(
			_aforemny$ncms$Material_Internal_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-snackbar'),
				_1: {
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Options$when,
						isActive,
						_aforemny$ncms$Material_Options$cs('mdc-snackbar--active')),
					_1: {
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Options$when,
							multiline,
							_aforemny$ncms$Material_Options$cs('mdc-snackbar--multiline')),
						_1: {
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Options$when,
								actionOnBottom,
								_aforemny$ncms$Material_Options$cs('mdc-snackbar--action-on-bottom')),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_aforemny$ncms$Material_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-snackbar__text'),
						_1: {ctor: '[]'}
					},
					A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(
							_elm_lang$core$Maybe$map,
							function (c) {
								return {
									ctor: '::',
									_0: _elm_lang$html$Html$text(c.message),
									_1: {ctor: '[]'}
								};
							},
							contents))),
				_1: {
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-snackbar__action-wrapper'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A4(
								_aforemny$ncms$Material_Options$styled_,
								_elm_lang$html$Html$button,
								{
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-button'),
									_1: {
										ctor: '::',
										_0: _aforemny$ncms$Material_Options$cs('mdc-snackbar__action-button'),
										_1: {
											ctor: '::',
											_0: dismissHandler,
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$type_('button'),
									_1: {ctor: '[]'}
								},
								A2(
									_elm_lang$core$Maybe$withDefault,
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$map,
										function (action) {
											return {
												ctor: '::',
												_0: _elm_lang$html$Html$text(action),
												_1: {ctor: '[]'}
											};
										},
										action))),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _aforemny$ncms$Material_Snackbar$enqueue = F2(
	function (contents, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				queue: A2(
					_elm_lang$core$List$append,
					model.queue,
					{
						ctor: '::',
						_0: contents,
						_1: {ctor: '[]'}
					})
			});
	});
var _aforemny$ncms$Material_Snackbar$next = function (model) {
	return _elm_lang$core$Platform_Cmd$map(
		_aforemny$ncms$Material_Internal_Snackbar$Move(model.seq));
};
var _aforemny$ncms$Material_Snackbar$snack = F2(
	function (message, label) {
		return {
			message: message,
			action: _elm_lang$core$Maybe$Just(label),
			timeout: 2750,
			fade: 250,
			multiline: true,
			actionOnBottom: false,
			dismissOnAction: true
		};
	});
var _aforemny$ncms$Material_Snackbar$toast = function (message) {
	return {message: message, action: _elm_lang$core$Maybe$Nothing, timeout: 2750, fade: 250, multiline: false, actionOnBottom: false, dismissOnAction: true};
};
var _aforemny$ncms$Material_Snackbar$Contents = F7(
	function (a, b, c, d, e, f, g) {
		return {message: a, action: b, timeout: c, fade: d, multiline: e, actionOnBottom: f, dismissOnAction: g};
	});
var _aforemny$ncms$Material_Snackbar$Model = F3(
	function (a, b, c) {
		return {queue: a, state: b, seq: c};
	});
var _aforemny$ncms$Material_Snackbar$Config = function (a) {
	return {onDismiss: a};
};
var _aforemny$ncms$Material_Snackbar$Fading = function (a) {
	return {ctor: 'Fading', _0: a};
};
var _aforemny$ncms$Material_Snackbar$Active = function (a) {
	return {ctor: 'Active', _0: a};
};
var _aforemny$ncms$Material_Snackbar$tryDequeue = function (model) {
	var _p6 = {ctor: '_Tuple2', _0: model.state, _1: model.queue};
	if (((_p6.ctor === '_Tuple2') && (_p6._0.ctor === 'Inert')) && (_p6._1.ctor === '::')) {
		var _p7 = _p6._1._0;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					state: _aforemny$ncms$Material_Snackbar$Active(_p7),
					queue: _p6._1._1,
					seq: model.seq + 1
				}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Platform_Cmd$map,
						_aforemny$ncms$Material_Internal_Snackbar$Move(model.seq + 1),
						A2(_aforemny$ncms$Material_Helpers$delay, _p7.timeout, _aforemny$ncms$Material_Internal_Snackbar$Timeout)),
					_1: {ctor: '[]'}
				})
		};
	} else {
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			model,
			{ctor: '[]'});
	}
};
var _aforemny$ncms$Material_Snackbar$Inert = {ctor: 'Inert'};
var _aforemny$ncms$Material_Snackbar$defaultModel = {
	queue: {ctor: '[]'},
	state: _aforemny$ncms$Material_Snackbar$Inert,
	seq: -1
};
var _aforemny$ncms$Material_Snackbar$add = F4(
	function (lift, idx, contents, model) {
		var component_ = A2(
			_elm_lang$core$Maybe$withDefault,
			_aforemny$ncms$Material_Snackbar$defaultModel,
			A2(_elm_lang$core$Dict$get, idx, model.mdl.snackbar));
		var _p8 = _aforemny$ncms$Material_Snackbar$tryDequeue(
			A2(_aforemny$ncms$Material_Snackbar$enqueue, contents, component_));
		var component = _p8._0;
		var effects = _p8._1;
		var mdl = function () {
			var mdl_ = model.mdl;
			return _elm_lang$core$Native_Utils.update(
				mdl_,
				{
					snackbar: A3(_elm_lang$core$Dict$insert, idx, component, mdl_.snackbar)
				});
		}();
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			_elm_lang$core$Native_Utils.update(
				model,
				{mdl: mdl}),
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Platform_Cmd$map,
					function (_p9) {
						return lift(
							A2(_aforemny$ncms$Material_Msg$SnackbarMsg, idx, _p9));
					},
					effects),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Snackbar$_p10 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.snackbar;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{snackbar: x});
		}),
	_aforemny$ncms$Material_Snackbar$defaultModel);
var _aforemny$ncms$Material_Snackbar$get = _aforemny$ncms$Material_Snackbar$_p10._0;
var _aforemny$ncms$Material_Snackbar$set = _aforemny$ncms$Material_Snackbar$_p10._1;
var _aforemny$ncms$Material_Snackbar$render = A3(_aforemny$ncms$Material_Component$render, _aforemny$ncms$Material_Snackbar$get, _aforemny$ncms$Material_Snackbar$view, _aforemny$ncms$Material_Msg$SnackbarMsg);
var _aforemny$ncms$Material_Snackbar$move = F2(
	function (transition, model) {
		var _p11 = {ctor: '_Tuple2', _0: model.state, _1: transition};
		_v4_4:
		do {
			if (_p11.ctor === '_Tuple2') {
				if (_p11._1.ctor === 'Clicked') {
					if (_p11._0.ctor === 'Active') {
						var _p12 = _p11._0._0;
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									state: _aforemny$ncms$Material_Snackbar$Fading(_p12)
								}),
							{
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Snackbar$next,
									model,
									A2(_aforemny$ncms$Material_Helpers$delay, _p12.fade, _aforemny$ncms$Material_Internal_Snackbar$Timeout)),
								_1: {ctor: '[]'}
							});
					} else {
						break _v4_4;
					}
				} else {
					switch (_p11._0.ctor) {
						case 'Inert':
							return _aforemny$ncms$Material_Snackbar$tryDequeue(model);
						case 'Active':
							var _p13 = _p11._0._0;
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{
										state: _aforemny$ncms$Material_Snackbar$Fading(_p13)
									}),
								{
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Snackbar$next,
										model,
										A2(_aforemny$ncms$Material_Helpers$delay, _p13.fade, _aforemny$ncms$Material_Internal_Snackbar$Timeout)),
									_1: {ctor: '[]'}
								});
						default:
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								_elm_lang$core$Native_Utils.update(
									model,
									{state: _aforemny$ncms$Material_Snackbar$Inert}),
								{
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Snackbar$next,
										model,
										_aforemny$ncms$Material_Helpers$cmd(_aforemny$ncms$Material_Internal_Snackbar$Timeout)),
									_1: {ctor: '[]'}
								});
					}
				}
			} else {
				break _v4_4;
			}
		} while(false);
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			model,
			{ctor: '[]'});
	});
var _aforemny$ncms$Material_Snackbar$update = F3(
	function (fwd, msg, model) {
		var _p14 = msg;
		if (_p14.ctor === 'Move') {
			return _elm_lang$core$Native_Utils.eq(_p14._0, model.seq) ? A2(
				_aforemny$ncms$Material_Helpers$map2nd,
				_elm_lang$core$Platform_Cmd$map(fwd),
				A2(_aforemny$ncms$Material_Snackbar$move, _p14._1, model)) : A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				model,
				{ctor: '[]'});
		} else {
			var fwdEffect = function () {
				var _p15 = _p14._1;
				if (_p15.ctor === 'Just') {
					return _aforemny$ncms$Material_Helpers$cmd(_p15._0);
				} else {
					return _elm_lang$core$Platform_Cmd$none;
				}
			}();
			return A2(
				_aforemny$ncms$Material_Helpers$map2nd,
				function (cmd) {
					return _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: cmd,
							_1: {
								ctor: '::',
								_0: fwdEffect,
								_1: {ctor: '[]'}
							}
						});
				},
				_p14._0 ? A3(
					_aforemny$ncms$Material_Snackbar$update,
					fwd,
					A2(_aforemny$ncms$Material_Internal_Snackbar$Move, model.seq, _aforemny$ncms$Material_Internal_Snackbar$Clicked),
					model) : A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					model,
					{ctor: '[]'}));
		}
	});
var _aforemny$ncms$Material_Snackbar$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			function (_p16) {
				return _elm_lang$core$Maybe$Just(
					A3(_aforemny$ncms$Material_Snackbar$set, idx, store, _p16));
			},
			A3(
				_aforemny$ncms$Material_Snackbar$update,
				lift,
				msg,
				A2(_aforemny$ncms$Material_Snackbar$get, idx, store)));
	});

var _aforemny$ncms$Material_Switch$on = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{value: true});
	});
var _aforemny$ncms$Material_Switch$disabled = _aforemny$ncms$Material_Options$many(
	{
		ctor: '::',
		_0: _aforemny$ncms$Material_Options$cs('mdc-checkbox--disabled'),
		_1: {
			ctor: '::',
			_0: _aforemny$ncms$Material_Internal_Options$input(
				{
					ctor: '::',
					_0: _aforemny$ncms$Material_Internal_Options$attribute(
						_elm_lang$html$Html_Attributes$disabled(true)),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		}
	});
var _aforemny$ncms$Material_Switch$defaultConfig = {
	input: {ctor: '[]'},
	container: {ctor: '[]'},
	value: false
};
var _aforemny$ncms$Material_Switch$view = F4(
	function (lift, model, options, _p0) {
		var _p1 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Switch$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		return A4(
			_aforemny$ncms$Material_Internal_Options$applyContainer,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-switch'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Internal_Options$attribute(
						_aforemny$ncms$Material_Helpers$blurOn('mouseup')),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A4(
					_aforemny$ncms$Material_Internal_Options$applyInput,
					summary,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-switch__native-control'),
						_1: {
							ctor: '::',
							_0: _aforemny$ncms$Material_Internal_Options$attribute(
								_elm_lang$html$Html_Attributes$type_('checkbox')),
							_1: {
								ctor: '::',
								_0: _aforemny$ncms$Material_Internal_Options$attribute(
									_elm_lang$html$Html_Attributes$checked(config.value)),
								_1: {
									ctor: '::',
									_0: A3(
										_aforemny$ncms$Material_Internal_Options$on1,
										'focus',
										lift,
										_aforemny$ncms$Material_Internal_Switch$SetFocus(true)),
									_1: {
										ctor: '::',
										_0: A3(
											_aforemny$ncms$Material_Internal_Options$on1,
											'blur',
											lift,
											_aforemny$ncms$Material_Internal_Switch$SetFocus(false)),
										_1: {
											ctor: '::',
											_0: A3(
												_aforemny$ncms$Material_Options$onWithOptions,
												'click',
												{preventDefault: true, stopPropagation: false},
												_elm_lang$core$Json_Decode$succeed(
													lift(_aforemny$ncms$Material_Internal_Switch$NoOp))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-switch__background'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A3(
								_aforemny$ncms$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-switch__knob'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _aforemny$ncms$Material_Switch$update = F3(
	function (_p2, msg, model) {
		var _p3 = msg;
		if (_p3.ctor === 'SetFocus') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					_elm_lang$core$Native_Utils.update(
						model,
						{isFocused: _p3._0})),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _aforemny$ncms$Material_Switch$defaultModel = {isFocused: false};
var _aforemny$ncms$Material_Switch$_p4 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.$switch;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{$switch: x});
		}),
	_aforemny$ncms$Material_Switch$defaultModel);
var _aforemny$ncms$Material_Switch$get = _aforemny$ncms$Material_Switch$_p4._0;
var _aforemny$ncms$Material_Switch$set = _aforemny$ncms$Material_Switch$_p4._1;
var _aforemny$ncms$Material_Switch$react = A4(_aforemny$ncms$Material_Component$react, _aforemny$ncms$Material_Switch$get, _aforemny$ncms$Material_Switch$set, _aforemny$ncms$Material_Msg$SwitchMsg, _aforemny$ncms$Material_Switch$update);
var _aforemny$ncms$Material_Switch$render = F4(
	function (lift, index, store, options) {
		return A7(
			_aforemny$ncms$Material_Component$render,
			_aforemny$ncms$Material_Switch$get,
			_aforemny$ncms$Material_Switch$view,
			_aforemny$ncms$Material_Msg$SwitchMsg,
			lift,
			index,
			store,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Internal_Options$dispatch(lift),
				_1: options
			});
	});
var _aforemny$ncms$Material_Switch$Model = function (a) {
	return {isFocused: a};
};
var _aforemny$ncms$Material_Switch$Config = F3(
	function (a, b, c) {
		return {input: a, container: b, value: c};
	});

var _aforemny$ncms$Material_Tabs$catMaybes = A2(
	_elm_lang$core$List$foldr,
	F2(
		function (maybe, accum) {
			return A2(
				_elm_lang$core$Maybe$withDefault,
				accum,
				A2(
					_elm_lang$core$Maybe$map,
					A2(
						_elm_lang$core$Basics$flip,
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							}),
						accum),
					maybe));
		}),
	{ctor: '[]'});
var _aforemny$ncms$Material_Tabs$decodeGeometry = function (hasIndicator) {
	return A3(
		_elm_lang$core$Json_Decode$map2,
		F2(
			function (tabs, scrollFrame) {
				return {tabs: tabs, scrollFrame: scrollFrame};
			}),
		A2(
			_elm_lang$core$Json_Decode$map,
			hasIndicator ? function (xs) {
				return A2(
					_elm_lang$core$List$take,
					_elm_lang$core$List$length(xs) - 1,
					xs);
			} : _elm_lang$core$Basics$identity,
			_debois$elm_dom$DOM$childNodes(
				A3(
					_elm_lang$core$Json_Decode$map2,
					F2(
						function (offsetLeft, width) {
							return {offsetLeft: offsetLeft, width: width};
						}),
					_debois$elm_dom$DOM$offsetLeft,
					_debois$elm_dom$DOM$offsetWidth))),
		_debois$elm_dom$DOM$parentElement(
			A2(
				_elm_lang$core$Json_Decode$map,
				function (width) {
					return {width: width};
				},
				_debois$elm_dom$DOM$offsetWidth)));
};
var _aforemny$ncms$Material_Tabs$decodeGeometryOnTabBar = function (hasIndicator) {
	return _debois$elm_dom$DOM$target(
		_aforemny$ncms$Material_Tabs$decodeGeometry(hasIndicator));
};
var _aforemny$ncms$Material_Tabs$decodeGeometryOnTab = function (hasIndicator) {
	return _debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$parentElement(
			_aforemny$ncms$Material_Tabs$decodeGeometry(hasIndicator)));
};
var _aforemny$ncms$Material_Tabs$decodeGeometryOnIndicator = function (hasIndicator) {
	return _debois$elm_dom$DOM$target(
		_debois$elm_dom$DOM$parentElement(
			A2(
				_debois$elm_dom$DOM$childNode,
				1,
				A2(
					_debois$elm_dom$DOM$childNode,
					0,
					_aforemny$ncms$Material_Tabs$decodeGeometry(hasIndicator)))));
};
var _aforemny$ncms$Material_Tabs$computeTotalTabsWidth = function (geometry) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (tab, accum) {
				return tab.width + accum;
			}),
		0,
		geometry.tabs);
};
var _aforemny$ncms$Material_Tabs$computeScale = F2(
	function (geometry, index) {
		var totalTabsWidth = _aforemny$ncms$Material_Tabs$computeTotalTabsWidth(geometry);
		var _p0 = _elm_lang$core$List$head(
			A2(_elm_lang$core$List$drop, index, geometry.tabs));
		if (_p0.ctor === 'Nothing') {
			return 1;
		} else {
			return _elm_lang$core$Native_Utils.eq(totalTabsWidth, 0) ? 1 : (_p0._0.width / totalTabsWidth);
		}
	});
var _aforemny$ncms$Material_Tabs$iconLabel = F2(
	function (options, str) {
		return A3(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$span,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-tab__icon-text'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(str),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Tabs$icon = F2(
	function (options, icon) {
		return A3(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$i,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-tab__icon'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(icon),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Tabs$tab = F2(
	function (options, childs) {
		return {
			node: F2(
				function (options, childs) {
					return A3(_aforemny$ncms$Material_Options$styled, _elm_lang$html$Html$div, options, childs);
				}),
			options: options,
			childs: childs
		};
	});
var _aforemny$ncms$Material_Tabs$indicator = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{indicator: true});
	});
var _aforemny$ncms$Material_Tabs$indicatorAccent = _aforemny$ncms$Material_Options$cs('mdc-tab-bar--indicator-accent');
var _aforemny$ncms$Material_Tabs$indicatorPrimary = _aforemny$ncms$Material_Options$cs('mdc-tab-bar--indicator-primary');
var _aforemny$ncms$Material_Tabs$withIconAndText = _aforemny$ncms$Material_Options$cs('mdc-tab--with-icon-and-text');
var _aforemny$ncms$Material_Tabs$scroller = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{scroller: true});
	});
var _aforemny$ncms$Material_Tabs$defaultConfig = {active: 0, scroller: false, indicator: false};
var _aforemny$ncms$Material_Tabs$view = F4(
	function (lift, model, options, nodes) {
		var indicatorTransform = function () {
			var tabLeft = A2(
				_elm_lang$core$Maybe$withDefault,
				0,
				A2(
					_elm_lang$core$Maybe$map,
					function (_) {
						return _.offsetLeft;
					},
					_elm_lang$core$List$head(
						A2(_elm_lang$core$List$drop, model.index, model.geometry.tabs))));
			return A2(
				_elm_lang$core$String$join,
				' ',
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						'translateX(',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(tabLeft),
							'px)')),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Basics_ops['++'],
							'scale(',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(model.scale),
								',1)')),
						_1: {ctor: '[]'}
					}
				});
		}();
		var tabBarTransform = A2(
			_elm_lang$core$Basics_ops['++'],
			'translateX(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(model.translationOffset),
				'px)'));
		var numTabs = _elm_lang$core$List$length(nodes);
		var summary = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Tabs$defaultConfig, options);
		var config = summary.config;
		var tabBarScroller = function (tabBar) {
			return A3(
				_aforemny$ncms$Material_Options$styled,
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__indicator'),
							_1: {
								ctor: '::',
								_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__indicator--back'),
								_1: {
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__indicator--enabled'),
									_1: {
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$when,
											!model.backIndicator,
											A2(_aforemny$ncms$Material_Options$css, 'display', 'none')),
										_1: {
											ctor: '::',
											_0: A2(
												_aforemny$ncms$Material_Options$on,
												'click',
												A2(
													_elm_lang$core$Json_Decode$map,
													function (_p1) {
														return lift(
															_aforemny$ncms$Material_Internal_Tabs$ScrollBackward(_p1));
													},
													_aforemny$ncms$Material_Tabs$decodeGeometryOnIndicator(config.indicator))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A3(
								_aforemny$ncms$Material_Options$styled,
								_elm_lang$html$Html$a,
								{
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar__indicator__inner'),
									_1: {
										ctor: '::',
										_0: _aforemny$ncms$Material_Options$cs('material-icons'),
										_1: {
											ctor: '::',
											_0: A2(_aforemny$ncms$Material_Options$css, 'pointer-events', 'none'),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('navigate_before'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_aforemny$ncms$Material_Options$styled,
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__scroll-frame'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: tabBar,
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_aforemny$ncms$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__indicator'),
									_1: {
										ctor: '::',
										_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__indicator--next'),
										_1: {
											ctor: '::',
											_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__indicator--enabled'),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_Options$on,
													'click',
													A2(
														_elm_lang$core$Json_Decode$map,
														function (_p2) {
															return lift(
																_aforemny$ncms$Material_Internal_Tabs$ScrollForward(_p2));
														},
														_aforemny$ncms$Material_Tabs$decodeGeometryOnIndicator(config.indicator))),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_Options$when,
														!model.nextIndicator,
														A2(_aforemny$ncms$Material_Options$css, 'display', 'none')),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								},
								{
									ctor: '::',
									_0: A3(
										_aforemny$ncms$Material_Options$styled,
										_elm_lang$html$Html$a,
										{
											ctor: '::',
											_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar__indicator__inner'),
											_1: {
												ctor: '::',
												_0: _aforemny$ncms$Material_Options$cs('material-icons'),
												_1: {
													ctor: '::',
													_0: A2(_aforemny$ncms$Material_Options$css, 'pointer-events', 'none'),
													_1: {ctor: '[]'}
												}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('navigate_next'),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				});
		};
		var hasIndicator = config.indicator;
		return (config.scroller ? tabBarScroller : _elm_lang$core$Basics$identity)(
			A5(
				_aforemny$ncms$Material_Internal_Options$apply,
				summary,
				_elm_lang$html$Html$nav,
				{
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar'),
					_1: {
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-upgraded'),
						_1: {
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$many(
								{
									ctor: '::',
									_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar-scroller__scroller-frame__tabs'),
									_1: {
										ctor: '::',
										_0: A2(_aforemny$ncms$Material_Options$css, 'transform', tabBarTransform),
										_1: {ctor: '[]'}
									}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$when,
									!model.initialized,
									A2(
										_aforemny$ncms$Material_Options$on,
										'mdc-init',
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p3) {
												return lift(
													_aforemny$ncms$Material_Internal_Tabs$Init(_p3));
											},
											_aforemny$ncms$Material_Tabs$decodeGeometryOnTabBar(config.indicator)))),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				{ctor: '[]'},
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: A2(
							_elm_lang$core$List$indexedMap,
							F2(
								function (index, _p4) {
									var _p5 = _p4;
									return A2(
										_p5.node,
										{
											ctor: '::',
											_0: _aforemny$ncms$Material_Options$cs('mdc-tab'),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_Options$when,
													_elm_lang$core$Native_Utils.eq(model.index, index),
													_aforemny$ncms$Material_Options$cs('mdc-tab--active')),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_Options$on,
														'click',
														A2(
															_elm_lang$core$Json_Decode$map,
															function (_p6) {
																return lift(
																	A2(_aforemny$ncms$Material_Internal_Tabs$Select, index, _p6));
															},
															_aforemny$ncms$Material_Tabs$decodeGeometryOnTab(hasIndicator))),
													_1: {
														ctor: '::',
														_0: _aforemny$ncms$Material_Options$dispatch(
															function (_p7) {
																return lift(
																	_aforemny$ncms$Material_Internal_Tabs$Dispatch(_p7));
															}),
														_1: _p5.options
													}
												}
											}
										},
										_p5.childs);
								}),
							nodes),
						_1: {
							ctor: '::',
							_0: config.indicator ? {
								ctor: '::',
								_0: A3(
									_aforemny$ncms$Material_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: _aforemny$ncms$Material_Options$cs('mdc-tab-bar__indicator'),
										_1: {
											ctor: '::',
											_0: A2(
												_aforemny$ncms$Material_Options$when,
												!(hasIndicator && model.initialized),
												A2(_aforemny$ncms$Material_Options$css, 'display', 'none')),
											_1: {
												ctor: '::',
												_0: A2(_aforemny$ncms$Material_Options$css, 'transform', indicatorTransform),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_Options$when,
														_elm_lang$core$Native_Utils.cmp(numTabs, 0) > 0,
														A2(_aforemny$ncms$Material_Options$css, 'visibility', 'visible')),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							} : {ctor: '[]'},
							_1: {ctor: '[]'}
						}
					})));
	});
var _aforemny$ncms$Material_Tabs$update = F3(
	function (lift, msg, model) {
		var _p8 = msg;
		switch (_p8.ctor) {
			case 'Dispatch':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					model,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Dispatch$forward(_p8._0),
						_1: {ctor: '[]'}
					});
			case 'Select':
				var _p9 = _p8._0;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							index: _p9,
							scale: A2(_aforemny$ncms$Material_Tabs$computeScale, _p8._1, _p9)
						}),
					{ctor: '[]'});
			case 'Init':
				var _p10 = _p8._0;
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					function () {
						if (!model.initialized) {
							var totalTabsWidth = A3(
								_elm_lang$core$List$foldl,
								F2(
									function (tab, accum) {
										return tab.width + accum;
									}),
								0,
								_p10.tabs);
							return _elm_lang$core$Native_Utils.update(
								model,
								{
									geometry: _p10,
									scale: A2(_aforemny$ncms$Material_Tabs$computeScale, _p10, 0),
									nextIndicator: _elm_lang$core$Native_Utils.cmp(totalTabsWidth, _p10.scrollFrame.width) > 0,
									backIndicator: false,
									initialized: true
								});
						} else {
							return model;
						}
					}(),
					{ctor: '[]'});
			case 'ScrollBackward':
				var _p17 = _p8._0;
				var totalTabsWidth = _aforemny$ncms$Material_Tabs$computeTotalTabsWidth(_p17);
				var scrollFrameWidth = _p17.scrollFrame.width;
				var concealedTabs = _aforemny$ncms$Material_Tabs$catMaybes(
					A2(
						_elm_lang$core$List$indexedMap,
						F2(
							function (index, tab) {
								var tabRight = tab.offsetLeft + tab.width;
								return (_elm_lang$core$Native_Utils.cmp(tabRight + model.translationOffset, 0) < 0) ? _elm_lang$core$Maybe$Just(
									{ctor: '_Tuple2', _0: index, _1: tab}) : _elm_lang$core$Maybe$Nothing;
							}),
						_elm_lang$core$List$reverse(_p17.tabs)));
				var translationOffset = _elm_lang$core$Tuple$second(
					A3(
						_elm_lang$core$List$foldl,
						F2(
							function (_p12, _p11) {
								var _p13 = _p12;
								var _p16 = _p13._1;
								var _p14 = _p11;
								var _p15 = _p14._0;
								var accum_ = _p15 + _p16.width;
								return (_elm_lang$core$Native_Utils.cmp(accum_, scrollFrameWidth) > 0) ? {ctor: '_Tuple2', _0: _p15, _1: 0 - _p16.offsetLeft} : {ctor: '_Tuple2', _0: accum_, _1: 0 - _p16.offsetLeft};
							}),
						{ctor: '_Tuple2', _0: 0, _1: model.translationOffset},
						concealedTabs));
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							geometry: _p17,
							translationOffset: translationOffset,
							nextIndicator: _elm_lang$core$Native_Utils.cmp(totalTabsWidth + translationOffset, scrollFrameWidth) > 0,
							backIndicator: _elm_lang$core$Native_Utils.cmp(translationOffset, 0) < 0
						}),
					{ctor: '[]'});
			default:
				var _p20 = _p8._0;
				var totalTabsWidth = _aforemny$ncms$Material_Tabs$computeTotalTabsWidth(_p20);
				var scrollFrameWidth = _p20.scrollFrame.width;
				var concealedTabs = _aforemny$ncms$Material_Tabs$catMaybes(
					A2(
						_elm_lang$core$List$indexedMap,
						F2(
							function (index, tab) {
								var tabRight = tab.offsetLeft + tab.width;
								return (_elm_lang$core$Native_Utils.cmp(tabRight + model.translationOffset, scrollFrameWidth) > 0) ? _elm_lang$core$Maybe$Just(
									{ctor: '_Tuple2', _0: index, _1: tab}) : _elm_lang$core$Maybe$Nothing;
							}),
						_p20.tabs));
				var translationOffset = A2(
					_elm_lang$core$Maybe$withDefault,
					model.translationOffset,
					A2(
						_elm_lang$core$Maybe$map,
						function (_p18) {
							var _p19 = _p18;
							return 0 - _p19._1.offsetLeft;
						},
						_elm_lang$core$List$head(concealedTabs)));
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{
							geometry: _p20,
							translationOffset: translationOffset,
							nextIndicator: _elm_lang$core$Native_Utils.cmp(totalTabsWidth + translationOffset, scrollFrameWidth) > 0,
							backIndicator: _elm_lang$core$Native_Utils.cmp(translationOffset, 0) < 0
						}),
					{ctor: '[]'});
		}
	});
var _aforemny$ncms$Material_Tabs$defaultModel = {index: 0, geometry: _aforemny$ncms$Material_Internal_Tabs$defaultGeometry, translationOffset: 0, scale: 0, nextIndicator: false, backIndicator: false, initialized: false};
var _aforemny$ncms$Material_Tabs$_p21 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.tabs;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tabs: x});
		}),
	_aforemny$ncms$Material_Tabs$defaultModel);
var _aforemny$ncms$Material_Tabs$get = _aforemny$ncms$Material_Tabs$_p21._0;
var _aforemny$ncms$Material_Tabs$set = _aforemny$ncms$Material_Tabs$_p21._1;
var _aforemny$ncms$Material_Tabs$react = F4(
	function (lift, msg, idx, store) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			function (_p22) {
				return _elm_lang$core$Maybe$Just(
					A3(_aforemny$ncms$Material_Tabs$set, idx, store, _p22));
			},
			A3(
				_aforemny$ncms$Material_Tabs$update,
				lift,
				msg,
				A2(_aforemny$ncms$Material_Tabs$get, idx, store)));
	});
var _aforemny$ncms$Material_Tabs$render = A3(_aforemny$ncms$Material_Component$render, _aforemny$ncms$Material_Tabs$get, _aforemny$ncms$Material_Tabs$view, _aforemny$ncms$Material_Msg$TabsMsg);
var _aforemny$ncms$Material_Tabs$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {index: a, geometry: b, translationOffset: c, scale: d, nextIndicator: e, backIndicator: f, initialized: g};
	});
var _aforemny$ncms$Material_Tabs$Config = F3(
	function (a, b, c) {
		return {active: a, scroller: b, indicator: c};
	});

var _aforemny$ncms$Material_Textfield$update = F3(
	function (_p0, msg, model) {
		return A3(
			_elm_lang$core$Basics$flip,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Platform_Cmd_ops['!'], x, y);
				}),
			{ctor: '[]'},
			function () {
				var _p1 = msg;
				switch (_p1.ctor) {
					case 'Input':
						var _p2 = _p1._0;
						var dirty = !_elm_lang$core$Native_Utils.eq(_p2, '');
						return _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{
									value: _elm_lang$core$Maybe$Just(_p2)
								}));
					case 'Blur':
						return _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{isFocused: false}));
					case 'Focus':
						return _elm_lang$core$Maybe$Just(
							_elm_lang$core$Native_Utils.update(
								model,
								{isFocused: true}));
					default:
						return _elm_lang$core$Maybe$Just(model);
				}
			}());
	});
var _aforemny$ncms$Material_Textfield$defaultModel = {isFocused: false, value: _elm_lang$core$Maybe$Nothing};
var _aforemny$ncms$Material_Textfield$_p3 = A3(
	_aforemny$ncms$Material_Component$indexed,
	function (_) {
		return _.textfield;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{textfield: x});
		}),
	_aforemny$ncms$Material_Textfield$defaultModel);
var _aforemny$ncms$Material_Textfield$get = _aforemny$ncms$Material_Textfield$_p3._0;
var _aforemny$ncms$Material_Textfield$set = _aforemny$ncms$Material_Textfield$_p3._1;
var _aforemny$ncms$Material_Textfield$react = A4(_aforemny$ncms$Material_Component$react, _aforemny$ncms$Material_Textfield$get, _aforemny$ncms$Material_Textfield$set, _aforemny$ncms$Material_Msg$TextfieldMsg, _aforemny$ncms$Material_Textfield$update);
var _aforemny$ncms$Material_Textfield$placeholder = function (value) {
	return _aforemny$ncms$Material_Internal_Options$input(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$attribute(
				A2(_elm_lang$html$Html_Attributes$attribute, 'placeholder', value)),
			_1: {ctor: '[]'}
		});
};
var _aforemny$ncms$Material_Textfield$multiline = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{multiline: true});
	});
var _aforemny$ncms$Material_Textfield$invalid = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{invalid: true});
	});
var _aforemny$ncms$Material_Textfield$fullWidth = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fullWidth: true});
	});
var _aforemny$ncms$Material_Textfield$type_ = function (_p4) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						type_: _elm_lang$core$Maybe$Just(value)
					});
			})(_p4));
};
var _aforemny$ncms$Material_Textfield$required = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{required: true});
	});
var _aforemny$ncms$Material_Textfield$dense = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{dense: true});
	});
var _aforemny$ncms$Material_Textfield$maxRows = function (k) {
	return _aforemny$ncms$Material_Internal_Options$option(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					maxRows: _elm_lang$core$Maybe$Just(k)
				});
		});
};
var _aforemny$ncms$Material_Textfield$cols = function (k) {
	return _aforemny$ncms$Material_Internal_Options$input(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$attribute(
				_elm_lang$html$Html_Attributes$cols(k)),
			_1: {ctor: '[]'}
		});
};
var _aforemny$ncms$Material_Textfield$rows = function (k) {
	return _aforemny$ncms$Material_Internal_Options$input(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$attribute(
				_elm_lang$html$Html_Attributes$rows(k)),
			_1: {ctor: '[]'}
		});
};
var _aforemny$ncms$Material_Textfield$pattern = function (_p5) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (value, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						pattern: _elm_lang$core$Maybe$Just(value)
					});
			})(_p5));
};
var _aforemny$ncms$Material_Textfield$textfield = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{textfieldBox: true});
	});
var _aforemny$ncms$Material_Textfield$email = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				type_: _elm_lang$core$Maybe$Just('email')
			});
	});
var _aforemny$ncms$Material_Textfield$password = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{
				type_: _elm_lang$core$Maybe$Just('password')
			});
	});
var _aforemny$ncms$Material_Textfield$input = _aforemny$ncms$Material_Options$input;
var _aforemny$ncms$Material_Textfield$disabled = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _aforemny$ncms$Material_Textfield$maxlength = function (k) {
	return _aforemny$ncms$Material_Options$attribute(
		_elm_lang$html$Html_Attributes$maxlength(k));
};
var _aforemny$ncms$Material_Textfield$autofocus = _aforemny$ncms$Material_Options$attribute(
	_elm_lang$html$Html_Attributes$autofocus(true));
var _aforemny$ncms$Material_Textfield$defaultValue = function (_p6) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						defaultValue: _elm_lang$core$Maybe$Just(str)
					});
			})(_p6));
};
var _aforemny$ncms$Material_Textfield$value = function (_p7) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						value: _elm_lang$core$Maybe$Just(str)
					});
			})(_p7));
};
var _aforemny$ncms$Material_Textfield$floatingLabel = _aforemny$ncms$Material_Internal_Options$option(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{labelFloat: true});
	});
var _aforemny$ncms$Material_Textfield$label = function (_p8) {
	return _aforemny$ncms$Material_Internal_Options$option(
		F2(
			function (str, config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						labelText: _elm_lang$core$Maybe$Just(str)
					});
			})(_p8));
};
var _aforemny$ncms$Material_Textfield$defaultConfig = {
	labelText: _elm_lang$core$Maybe$Nothing,
	labelFloat: false,
	value: _elm_lang$core$Maybe$Nothing,
	defaultValue: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	input: {ctor: '[]'},
	container: {ctor: '[]'},
	maxRows: _elm_lang$core$Maybe$Nothing,
	dense: false,
	required: false,
	type_: _elm_lang$core$Maybe$Just('text'),
	textfieldBox: false,
	pattern: _elm_lang$core$Maybe$Nothing,
	multiline: false,
	fullWidth: false,
	invalid: false
};
var _aforemny$ncms$Material_Textfield$view = F4(
	function (lift, model, options, _p9) {
		var _p10 = A2(_aforemny$ncms$Material_Internal_Options$collect, _aforemny$ncms$Material_Textfield$defaultConfig, options);
		var summary = _p10;
		var config = _p10.config;
		var preventEnterWhenMaxRowsExceeded = A2(
			_aforemny$ncms$Material_Options$when,
			config.multiline && (!_elm_lang$core$Native_Utils.eq(config.maxRows, _elm_lang$core$Maybe$Nothing)),
			A3(
				_aforemny$ncms$Material_Options$onWithOptions,
				'keydown',
				_elm_lang$core$Native_Utils.update(
					_elm_lang$html$Html_Events$defaultOptions,
					{preventDefault: true}),
				A2(
					_elm_lang$core$Json_Decode$andThen,
					function (_p11) {
						var _p12 = _p11;
						var rows = _elm_lang$core$List$length(
							A2(_elm_lang$core$String$split, '\n', _p12._1));
						return ((_elm_lang$core$Native_Utils.cmp(
							rows,
							A2(_elm_lang$core$Maybe$withDefault, 0, config.maxRows)) > -1) && _elm_lang$core$Native_Utils.eq(_p12._0, 13)) ? _elm_lang$core$Json_Decode$succeed(
							lift(_aforemny$ncms$Material_Internal_Textfield$NoOp)) : _elm_lang$core$Json_Decode$fail('');
					},
					A3(
						_elm_lang$core$Json_Decode$map2,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_elm_lang$html$Html_Events$keyCode,
						_elm_lang$html$Html_Events$targetValue))));
		var isFocused = model.isFocused && (!config.disabled);
		var value = function () {
			var _p13 = config.value;
			if (_p13.ctor === 'Just') {
				return _elm_lang$core$Maybe$Just(_p13._0);
			} else {
				var _p14 = config.defaultValue;
				if (_p14.ctor === 'Just') {
					return _elm_lang$core$Maybe$Just(_p14._0);
				} else {
					return model.value;
				}
			}
		}();
		var isDirty = function () {
			var _p15 = value;
			if (_p15.ctor === 'Just') {
				if (_p15._0 === '') {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		}();
		var isInvalid = function () {
			var _p16 = config.pattern;
			if (_p16.ctor === 'Just') {
				return A2(
					_elm_lang$core$Maybe$withDefault,
					false,
					A2(
						_elm_lang$core$Maybe$map,
						function (_p17) {
							return !A2(
								_elm_lang$core$Regex$contains,
								_elm_lang$core$Regex$regex(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'^',
										A2(_elm_lang$core$Basics_ops['++'], _p16._0, '$'))),
								_p17);
						},
						value));
			} else {
				return false;
			}
		}();
		return A4(
			_aforemny$ncms$Material_Internal_Options$applyContainer,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-textfield'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('mdc-textfield--upgraded'),
					_1: {
						ctor: '::',
						_0: A3(_aforemny$ncms$Material_Internal_Options$on1, 'focus', lift, _aforemny$ncms$Material_Internal_Textfield$Focus),
						_1: {
							ctor: '::',
							_0: A3(_aforemny$ncms$Material_Internal_Options$on1, 'blur', lift, _aforemny$ncms$Material_Internal_Textfield$Blur),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$when,
									isFocused,
									_aforemny$ncms$Material_Options$cs('mdc-textfield--focused')),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Options$when,
										config.disabled,
										_aforemny$ncms$Material_Options$cs('mdc-textfield--disabled')),
									_1: {
										ctor: '::',
										_0: A2(
											_aforemny$ncms$Material_Options$when,
											config.dense,
											_aforemny$ncms$Material_Options$cs('mdc-textfield--dense')),
										_1: {
											ctor: '::',
											_0: A2(
												_aforemny$ncms$Material_Options$when,
												config.fullWidth,
												_aforemny$ncms$Material_Options$cs('mdc-textfield--fullwidth')),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_Options$when,
													isInvalid,
													_aforemny$ncms$Material_Options$cs('mdc-textfield--invalid')),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_Options$when,
														config.multiline,
														_aforemny$ncms$Material_Options$cs('mdc-textfield--multiline')),
													_1: {
														ctor: '::',
														_0: preventEnterWhenMaxRowsExceeded,
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A4(
					_aforemny$ncms$Material_Internal_Options$applyInput,
					summary,
					config.multiline ? _elm_lang$html$Html$textarea : _elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Options$cs('mdc-textfield__input'),
						_1: {
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Options$css, 'outline', 'none'),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$when,
									config.textfieldBox,
									_aforemny$ncms$Material_Options$cs('mdc-textfield--box')),
								_1: {
									ctor: '::',
									_0: A3(_aforemny$ncms$Material_Internal_Options$on1, 'focus', lift, _aforemny$ncms$Material_Internal_Textfield$Focus),
									_1: {
										ctor: '::',
										_0: A3(_aforemny$ncms$Material_Internal_Options$on1, 'blur', lift, _aforemny$ncms$Material_Internal_Textfield$Blur),
										_1: {
											ctor: '::',
											_0: _aforemny$ncms$Material_Options$onInput(
												function (_p18) {
													return lift(
														_aforemny$ncms$Material_Internal_Textfield$Input(_p18));
												}),
											_1: {
												ctor: '::',
												_0: function (_p19) {
													return _aforemny$ncms$Material_Options$many(
														A2(
															_elm_lang$core$List$map,
															_aforemny$ncms$Material_Internal_Options$attribute,
															A2(_elm_lang$core$List$filterMap, _elm_lang$core$Basics$identity, _p19)));
												}(
													{
														ctor: '::',
														_0: ((!config.multiline) ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
															_elm_lang$html$Html_Attributes$type_(
																A2(_elm_lang$core$Maybe$withDefault, 'text', config.type_))),
														_1: {
															ctor: '::',
															_0: (config.disabled ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																_elm_lang$html$Html_Attributes$disabled(true)),
															_1: {
																ctor: '::',
																_0: (config.required ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																	A2(
																		_elm_lang$html$Html_Attributes$property,
																		'required',
																		_elm_lang$core$Json_Encode$bool(true))),
																_1: {
																	ctor: '::',
																	_0: ((!_elm_lang$core$Native_Utils.eq(config.pattern, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																		A2(
																			_elm_lang$html$Html_Attributes$property,
																			'pattern',
																			_elm_lang$core$Json_Encode$string(
																				A2(_elm_lang$core$Maybe$withDefault, '', config.pattern)))),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$core$Maybe$Just(
																			A2(_elm_lang$html$Html_Attributes$attribute, 'outline', 'medium none')),
																		_1: {
																			ctor: '::',
																			_0: ((!_elm_lang$core$Native_Utils.eq(config.value, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																				_elm_lang$html$Html_Attributes$value(
																					A2(_elm_lang$core$Maybe$withDefault, '', config.value))),
																			_1: {
																				ctor: '::',
																				_0: ((!_elm_lang$core$Native_Utils.eq(config.defaultValue, _elm_lang$core$Maybe$Nothing)) ? _elm_lang$core$Maybe$Just : _elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing))(
																					_elm_lang$html$Html_Attributes$defaultValue(
																						A2(_elm_lang$core$Maybe$withDefault, '', config.defaultValue))),
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															}
														}
													}),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$label,
						{
							ctor: '::',
							_0: _aforemny$ncms$Material_Options$cs('mdc-textfield__label'),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Options$when,
									isFocused || isDirty,
									_aforemny$ncms$Material_Options$cs('mdc-textfield__label--float-above')),
								_1: {ctor: '[]'}
							}
						},
						function () {
							var _p20 = config.labelText;
							if (_p20.ctor === 'Just') {
								return {
									ctor: '::',
									_0: _elm_lang$html$Html$text(_p20._0),
									_1: {ctor: '[]'}
								};
							} else {
								return {ctor: '[]'};
							}
						}()),
					_1: {
						ctor: '::',
						_0: A3(
							_aforemny$ncms$Material_Options$styled,
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _aforemny$ncms$Material_Options$cs('mdc-textfield__bottom-line'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _aforemny$ncms$Material_Textfield$render = F4(
	function (lift, index, store, options) {
		return A7(_aforemny$ncms$Material_Component$render, _aforemny$ncms$Material_Textfield$get, _aforemny$ncms$Material_Textfield$view, _aforemny$ncms$Material_Msg$TextfieldMsg, lift, index, store, options);
	});
var _aforemny$ncms$Material_Textfield$Config = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return {labelText: a, labelFloat: b, value: c, defaultValue: d, disabled: e, input: f, container: g, maxRows: h, dense: i, required: j, type_: k, textfieldBox: l, pattern: m, multiline: n, fullWidth: o, invalid: p};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _aforemny$ncms$Material_Textfield$Model = F2(
	function (a, b) {
		return {isFocused: a, value: b};
	});

var _aforemny$ncms$Material$top = function (content) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: content,
			_1: {
				ctor: '::',
				_0: A3(
					_elm_lang$html$Html$node,
					'style',
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('text/css'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(
								_elm_lang$core$String$join,
								'\n',
								A2(
									_elm_lang$core$List$map,
									function (url) {
										return A2(
											_elm_lang$core$Basics_ops['++'],
											'@import url(',
											A2(_elm_lang$core$Basics_ops['++'], url, ');'));
									},
									{
										ctor: '::',
										_0: 'https://fonts.googleapis.com/css?family=Roboto+Mono',
										_1: {
											ctor: '::',
											_0: 'https://fonts.googleapis.com/icon?family=Material+Icons',
											_1: {
												ctor: '::',
												_0: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500',
												_1: {
													ctor: '::',
													_0: 'https://aforemny.github.io/elm-mdc/material-components-web.css',
													_1: {
														ctor: '::',
														_0: 'https://aforemny.github.io/elm-mdc/assets/dialog/dialog-polyfill.css',
														_1: {ctor: '[]'}
													}
												}
											}
										}
									}))),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$html$Html$node,
						'script',
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$type_('text/javascript'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$src('https://aforemny.github.io/elm-mdc/assets/dialog-polyfill.js'),
								_1: {ctor: '[]'}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$html$Html$node,
							'script',
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$type_('text/javascript'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('\nvar insertListener = function(event) {\n  if (event.animationName == \"nodeInserted\") {\n    console.warn(\"Another node has been inserted! \", event, event.target);\n    event.target.dispatchEvent(new Event(\'mdc-init\'));\n  }\n}\n\ndocument.addEventListener(\"animationstart\", insertListener, false); // standard + firefox\ndocument.addEventListener(\"MSAnimationStart\", insertListener, false); // IE\ndocument.addEventListener(\"webkitAnimationStart\", insertListener, false); // Chrome + Safari\n'),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_elm_lang$html$Html$node,
								'style',
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$type_('text/css'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('\n@keyframes nodeInserted {\n  from { opacity: 0.99; }\n  to { opacity: 1; }\n}\n\n.mdc-tab-bar {\n  animation-duration: 0.001s;\n  animation-name: nodeInserted;\n}\n'),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _aforemny$ncms$Material$init = function (lift) {
	return _elm_lang$core$Platform_Cmd$none;
};
var _aforemny$ncms$Material$subscriptions = F2(
	function (lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: A2(_aforemny$ncms$Material_Menu$subs, lift, model.mdl),
				_1: {
					ctor: '::',
					_0: A2(_aforemny$ncms$Material_Select$subs, lift, model.mdl),
					_1: {
						ctor: '::',
						_0: A2(_aforemny$ncms$Material_Drawer$subs, lift, model.mdl),
						_1: {
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Slider$subs, lift, model.mdl),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _aforemny$ncms$Material$update_ = F3(
	function (lift, msg, store) {
		var _p0 = msg;
		switch (_p0.ctor) {
			case 'ButtonMsg':
				return A4(_aforemny$ncms$Material_Button$react, lift, _p0._1, _p0._0, store);
			case 'RadioMsg':
				return A4(_aforemny$ncms$Material_Radio$react, lift, _p0._1, _p0._0, store);
			case 'DrawerMsg':
				return A4(_aforemny$ncms$Material_Drawer$react, lift, _p0._1, _p0._0, store);
			case 'IconToggleMsg':
				return A4(_aforemny$ncms$Material_IconToggle$react, lift, _p0._1, _p0._0, store);
			case 'SnackbarMsg':
				var _p2 = _p0._0;
				return A4(
					_aforemny$ncms$Material_Snackbar$react,
					function (_p1) {
						return lift(
							A2(_aforemny$ncms$Material_Msg$SnackbarMsg, _p2, _p1));
					},
					_p0._1,
					_p2,
					store);
			case 'FabMsg':
				return A4(_aforemny$ncms$Material_Fab$react, lift, _p0._1, _p0._0, store);
			case 'TextfieldMsg':
				return A4(_aforemny$ncms$Material_Textfield$react, lift, _p0._1, _p0._0, store);
			case 'MenuMsg':
				var _p4 = _p0._0;
				return A4(
					_aforemny$ncms$Material_Menu$react,
					function (_p3) {
						return lift(
							A2(_aforemny$ncms$Material_Msg$MenuMsg, _p4, _p3));
					},
					_p0._1,
					_p4,
					store);
			case 'SelectMsg':
				var _p6 = _p0._0;
				return A4(
					_aforemny$ncms$Material_Select$react,
					function (_p5) {
						return lift(
							A2(_aforemny$ncms$Material_Msg$SelectMsg, _p6, _p5));
					},
					_p0._1,
					_p6,
					store);
			case 'CheckboxMsg':
				return A4(_aforemny$ncms$Material_Checkbox$react, lift, _p0._1, _p0._0, store);
			case 'SwitchMsg':
				return A4(_aforemny$ncms$Material_Switch$react, lift, _p0._1, _p0._0, store);
			case 'SliderMsg':
				var _p8 = _p0._0;
				return A4(
					_aforemny$ncms$Material_Slider$react,
					function (_p7) {
						return lift(
							A2(_aforemny$ncms$Material_Msg$SliderMsg, _p8, _p7));
					},
					_p0._1,
					_p8,
					store);
			case 'TabsMsg':
				var _p10 = _p0._0;
				return A4(
					_aforemny$ncms$Material_Tabs$react,
					function (_p9) {
						return lift(
							A2(_aforemny$ncms$Material_Msg$TabsMsg, _p10, _p9));
					},
					_p0._1,
					_p10,
					store);
			case 'RippleMsg':
				return A4(_aforemny$ncms$Material_Ripple$react, lift, _p0._1, _p0._0, store);
			default:
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Nothing,
					_1: _aforemny$ncms$Material_Dispatch$forward(_p0._0)
				};
		}
	});
var _aforemny$ncms$Material$update = F3(
	function (lift, msg, container) {
		return A2(
			_aforemny$ncms$Material_Helpers$map1st,
			_elm_lang$core$Maybe$withDefault(container),
			A2(
				_aforemny$ncms$Material_Helpers$map1st,
				_elm_lang$core$Maybe$map(
					function (mdl) {
						return _elm_lang$core$Native_Utils.update(
							container,
							{mdl: mdl});
					}),
				A3(
					_aforemny$ncms$Material$update_,
					lift,
					msg,
					function (_) {
						return _.mdl;
					}(container))));
	});
var _aforemny$ncms$Material$defaultModel = {button: _elm_lang$core$Dict$empty, radio: _elm_lang$core$Dict$empty, drawer: _elm_lang$core$Dict$empty, iconToggle: _elm_lang$core$Dict$empty, fab: _elm_lang$core$Dict$empty, textfield: _elm_lang$core$Dict$empty, menu: _elm_lang$core$Dict$empty, checkbox: _elm_lang$core$Dict$empty, $switch: _elm_lang$core$Dict$empty, tabs: _elm_lang$core$Dict$empty, select: _elm_lang$core$Dict$empty, ripple: _elm_lang$core$Dict$empty, snackbar: _elm_lang$core$Dict$empty, slider: _elm_lang$core$Dict$empty};
var _aforemny$ncms$Material$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return {button: a, radio: b, drawer: c, iconToggle: d, fab: e, textfield: f, menu: g, checkbox: h, $switch: i, tabs: j, select: k, ripple: l, snackbar: m, slider: n};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};

var _aforemny$ncms$Material_Card$darkTheme = _aforemny$ncms$Material_Options$cs('mdc-card--theme-dark');
var _aforemny$ncms$Material_Card$view = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$horizontalBlock = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__horizontal-block'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$vertical = _aforemny$ncms$Material_Options$cs('mdc-card__actions--vertical');
var _aforemny$ncms$Material_Card$actions = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__actions'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$supportingText = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__supporting-text'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$x3 = _aforemny$ncms$Material_Options$cs('mdc-card__media-item--3x');
var _aforemny$ncms$Material_Card$x2 = _aforemny$ncms$Material_Options$cs('mdc-card__media-item--2x');
var _aforemny$ncms$Material_Card$x1dot5 = _aforemny$ncms$Material_Options$cs('mdc-card__media-item--1dot5x');
var _aforemny$ncms$Material_Card$mediaItem = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__media-item'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$media = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__media'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$subtitle = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__subtitle'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$large = _aforemny$ncms$Material_Options$cs('mdc-card__title--large');
var _aforemny$ncms$Material_Card$title = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__title'),
			_1: options
		});
};
var _aforemny$ncms$Material_Card$primary = function (options) {
	return _aforemny$ncms$Material_Options$div(
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-card__primary'),
			_1: options
		});
};

var _aforemny$ncms$Material_Drawer_Permanent$toolbarSpacer = _aforemny$ncms$Material_Drawer$toolbarSpacer;
var _aforemny$ncms$Material_Drawer_Permanent$toggle = _aforemny$ncms$Material_Drawer$toggle(false);
var _aforemny$ncms$Material_Drawer_Permanent$close = _aforemny$ncms$Material_Drawer$close;
var _aforemny$ncms$Material_Drawer_Permanent$open = _aforemny$ncms$Material_Drawer$open(false);
var _aforemny$ncms$Material_Drawer_Permanent$subscriptions = _aforemny$ncms$Material_Drawer$subscriptions;
var _aforemny$ncms$Material_Drawer_Permanent$subs = _aforemny$ncms$Material_Drawer$subs;
var _aforemny$ncms$Material_Drawer_Permanent$react = _aforemny$ncms$Material_Drawer$react;
var _aforemny$ncms$Material_Drawer_Permanent$className = 'mdc-permanent-drawer';
var _aforemny$ncms$Material_Drawer_Permanent$view = _aforemny$ncms$Material_Drawer$view(_aforemny$ncms$Material_Drawer_Permanent$className);
var _aforemny$ncms$Material_Drawer_Permanent$header = _aforemny$ncms$Material_Drawer$header(_aforemny$ncms$Material_Drawer_Permanent$className);
var _aforemny$ncms$Material_Drawer_Permanent$headerContent = _aforemny$ncms$Material_Drawer$headerContent(_aforemny$ncms$Material_Drawer_Permanent$className);
var _aforemny$ncms$Material_Drawer_Permanent$content = _aforemny$ncms$Material_Drawer$content(_aforemny$ncms$Material_Drawer_Permanent$className);
var _aforemny$ncms$Material_Drawer_Permanent$render = _aforemny$ncms$Material_Drawer$render(_aforemny$ncms$Material_Drawer_Permanent$className);
var _aforemny$ncms$Material_Drawer_Permanent$defaultConfig = _aforemny$ncms$Material_Drawer$defaultConfig;
var _aforemny$ncms$Material_Drawer_Permanent$update = _aforemny$ncms$Material_Drawer$update;
var _aforemny$ncms$Material_Drawer_Permanent$defaultModel = _aforemny$ncms$Material_Drawer$defaultModel;

var _aforemny$ncms$Material_Elevation$transition = function (duration) {
	return A2(
		_aforemny$ncms$Material_Options$css,
		'transition',
		A2(
			_elm_lang$core$Basics_ops['++'],
			'box-shadow ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(duration),
				'ms ease-in-out 0s')));
};
var _aforemny$ncms$Material_Elevation$elevation = function (z) {
	return _aforemny$ncms$Material_Options$cs(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'mdc-elevation--z',
			_elm_lang$core$Basics$toString(
				A3(_elm_lang$core$Basics$clamp, 0, 24, z))));
};

var _aforemny$ncms$Material_Theme$dark = _aforemny$ncms$Material_Options$cs('mdc-theme--dark');
var _aforemny$ncms$Material_Theme$textIconOnDark = F2(
	function (options, icon) {
		return A2(
			_aforemny$ncms$Material_Options$span,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-theme--text-icon-on-dark'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: options
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(icon),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Theme$textDisabledOnDark = _aforemny$ncms$Material_Options$cs('mdc-theme--text-disabled-on-dark');
var _aforemny$ncms$Material_Theme$textHintOnDark = _aforemny$ncms$Material_Options$cs('mdc-theme--text-hint-on-dark');
var _aforemny$ncms$Material_Theme$textSecondaryOnDark = _aforemny$ncms$Material_Options$cs('mdc-theme--text-secondary-on-dark');
var _aforemny$ncms$Material_Theme$textPrimaryOnDark = _aforemny$ncms$Material_Options$cs('mdc-theme--text-primary-on-dark');
var _aforemny$ncms$Material_Theme$textIconOnLight = F2(
	function (options, icon) {
		return A2(
			_aforemny$ncms$Material_Options$span,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-theme--text-icon-on-light'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: options
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(icon),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Theme$textDisabledOnLight = _aforemny$ncms$Material_Options$cs('mdc-theme--text-disabled-on-light');
var _aforemny$ncms$Material_Theme$textHintOnLight = _aforemny$ncms$Material_Options$cs('mdc-theme--text-hint-on-light');
var _aforemny$ncms$Material_Theme$textSecondaryOnLight = _aforemny$ncms$Material_Options$cs('mdc-theme--text-secondary-on-light');
var _aforemny$ncms$Material_Theme$textPrimaryOnLight = _aforemny$ncms$Material_Options$cs('mdc-theme--text-primary-on-light');
var _aforemny$ncms$Material_Theme$textIconOnBackground = F2(
	function (options, icon) {
		return A2(
			_aforemny$ncms$Material_Options$span,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-theme--text-icon-on-background'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: options
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(icon),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Theme$textDisabledOnBackground = _aforemny$ncms$Material_Options$cs('mdc-theme--text-disabled-on-background');
var _aforemny$ncms$Material_Theme$textHintOnBackground = _aforemny$ncms$Material_Options$cs('mdc-theme--text-hint-on-background');
var _aforemny$ncms$Material_Theme$textSecondaryOnBackground = _aforemny$ncms$Material_Options$cs('mdc-theme--text-secondary-on-background');
var _aforemny$ncms$Material_Theme$textPrimaryOnBackground = _aforemny$ncms$Material_Options$cs('mdc-theme--text-primary-on-background');
var _aforemny$ncms$Material_Theme$textIconOnAccent = F2(
	function (options, icon) {
		return A2(
			_aforemny$ncms$Material_Options$span,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-theme--text-icon-on-accent'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: options
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(icon),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Theme$textDisabledOnAccent = _aforemny$ncms$Material_Options$cs('mdc-theme--text-disabled-on-accent');
var _aforemny$ncms$Material_Theme$textHintOnAccent = _aforemny$ncms$Material_Options$cs('mdc-theme--text-hint-on-accent');
var _aforemny$ncms$Material_Theme$textSecondaryOnAccent = _aforemny$ncms$Material_Options$cs('mdc-theme--text-secondary-on-accent');
var _aforemny$ncms$Material_Theme$textPrimaryOnAccent = _aforemny$ncms$Material_Options$cs('mdc-theme--text-primary-on-accent');
var _aforemny$ncms$Material_Theme$textIconOnPrimary = F2(
	function (options, icon) {
		return A2(
			_aforemny$ncms$Material_Options$span,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-theme--text-icon-on-primary'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: options
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(icon),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Theme$textDisabledOnPrimary = _aforemny$ncms$Material_Options$cs('mdc-theme--text-disabled-on-primary');
var _aforemny$ncms$Material_Theme$textHintOnPrimary = _aforemny$ncms$Material_Options$cs('mdc-theme--text-hint-on-primary');
var _aforemny$ncms$Material_Theme$textSecondaryOnPrimary = _aforemny$ncms$Material_Options$cs('mdc-theme--text-secondary-on-primary');
var _aforemny$ncms$Material_Theme$textPrimaryOnPrimary = _aforemny$ncms$Material_Options$cs('mdc-theme--text-primary-on-primary');
var _aforemny$ncms$Material_Theme$background = _aforemny$ncms$Material_Options$cs('mdc-theme--background');
var _aforemny$ncms$Material_Theme$accentBg = _aforemny$ncms$Material_Options$cs('mdc-theme--accent-bg');
var _aforemny$ncms$Material_Theme$primaryBg = _aforemny$ncms$Material_Options$cs('mdc-theme--primary-bg');
var _aforemny$ncms$Material_Theme$accent = _aforemny$ncms$Material_Options$cs('mdc-theme--accent');
var _aforemny$ncms$Material_Theme$primary = _aforemny$ncms$Material_Options$cs('mdc-theme--primary');

var _aforemny$ncms$Material_Toolbar$fixedAdjust = _aforemny$ncms$Material_Options$cs('mdc-toolbar-fixed-adjust');
var _aforemny$ncms$Material_Toolbar$alignEnd = _aforemny$ncms$Material_Options$cs('mdc-toolbar__section--align-end');
var _aforemny$ncms$Material_Toolbar$alignStart = _aforemny$ncms$Material_Options$cs('mdc-toolbar__section--align-start');
var _aforemny$ncms$Material_Toolbar$section = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$section,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-toolbar__section'),
			_1: options
		});
};
var _aforemny$ncms$Material_Toolbar$row = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-toolbar__row'),
			_1: options
		});
};
var _aforemny$ncms$Material_Toolbar$title = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$span,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-toolbar__title'),
			_1: options
		});
};
var _aforemny$ncms$Material_Toolbar$menu = _aforemny$ncms$Material_Options$cs('mdc-toolbar__icon--menu');
var _aforemny$ncms$Material_Toolbar$icon_ = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-toolbar__icon'),
			_1: {
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('material-icons'),
				_1: options
			}
		});
};
var _aforemny$ncms$Material_Toolbar$icon = F2(
	function (options, icon) {
		return A3(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Options$cs('mdc-toolbar__icon'),
				_1: {
					ctor: '::',
					_0: _aforemny$ncms$Material_Options$cs('material-icons'),
					_1: options
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(icon),
				_1: {ctor: '[]'}
			});
	});
var _aforemny$ncms$Material_Toolbar$flexibleSpaceMaximized = _aforemny$ncms$Material_Options$cs('mdc-toolbar--flexible-space-maximized');
var _aforemny$ncms$Material_Toolbar$flexibleDefaultBehavior = _aforemny$ncms$Material_Options$cs('mdc-toolbar--flexible-default-behavior');
var _aforemny$ncms$Material_Toolbar$flexible = _aforemny$ncms$Material_Options$cs('mdc-toolbar--flexible');
var _aforemny$ncms$Material_Toolbar$waterfall = _aforemny$ncms$Material_Options$cs('mdc-toolbar--waterfall');
var _aforemny$ncms$Material_Toolbar$fixed = _aforemny$ncms$Material_Options$cs('mdc-toolbar--fixed');
var _aforemny$ncms$Material_Toolbar$view = function (options) {
	return A2(
		_aforemny$ncms$Material_Options$styled,
		_elm_lang$html$Html$header,
		{
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('mdc-toolbar'),
			_1: options
		});
};

var _aforemny$ncms$Material_Typography$adjustMargin = _aforemny$ncms$Material_Options$cs('mdc-typography--adjust-margin');
var _aforemny$ncms$Material_Typography$subheading2 = _aforemny$ncms$Material_Options$cs('mdc-typography--subheading');
var _aforemny$ncms$Material_Typography$subheading1 = _aforemny$ncms$Material_Options$cs('mdc-typography--subheading');
var _aforemny$ncms$Material_Typography$headline = _aforemny$ncms$Material_Options$cs('mdc-typography--headline');
var _aforemny$ncms$Material_Typography$body2 = _aforemny$ncms$Material_Options$cs('mdc-typography--body2');
var _aforemny$ncms$Material_Typography$caption = _aforemny$ncms$Material_Options$cs('mdc-typography--caption');
var _aforemny$ncms$Material_Typography$title = _aforemny$ncms$Material_Options$cs('mdc-typography--title');
var _aforemny$ncms$Material_Typography$display4 = _aforemny$ncms$Material_Options$cs('mdc-typography--display4');
var _aforemny$ncms$Material_Typography$display3 = _aforemny$ncms$Material_Options$cs('mdc-typography--display3');
var _aforemny$ncms$Material_Typography$display2 = _aforemny$ncms$Material_Options$cs('mdc-typography--display2');
var _aforemny$ncms$Material_Typography$display1 = _aforemny$ncms$Material_Options$cs('mdc-typography--display1');
var _aforemny$ncms$Material_Typography$typography = _aforemny$ncms$Material_Options$cs('mdc-typography');

var _elm_lang$navigation$Native_Navigation = function() {


// FAKE NAVIGATION

function go(n)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		if (n !== 0)
		{
			history.go(n);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function pushState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.pushState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function replaceState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.replaceState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}


// REAL NAVIGATION

function reloadPage(skipCache)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		document.location.reload(skipCache);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function setLocation(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		try
		{
			window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			document.location.reload(false);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


// GET LOCATION

function getLocation()
{
	var location = document.location;

	return {
		href: location.href,
		host: location.host,
		hostname: location.hostname,
		protocol: location.protocol,
		origin: location.origin,
		port_: location.port,
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
		username: location.username,
		password: location.password
	};
}


// DETECT IE11 PROBLEMS

function isInternetExplorer11()
{
	return window.navigator.userAgent.indexOf('Trident') !== -1;
}


return {
	go: go,
	setLocation: setLocation,
	reloadPage: reloadPage,
	pushState: pushState,
	replaceState: replaceState,
	getLocation: getLocation,
	isInternetExplorer11: isInternetExplorer11
};

}();

var _elm_lang$navigation$Navigation$replaceState = _elm_lang$navigation$Native_Navigation.replaceState;
var _elm_lang$navigation$Navigation$pushState = _elm_lang$navigation$Native_Navigation.pushState;
var _elm_lang$navigation$Navigation$go = _elm_lang$navigation$Native_Navigation.go;
var _elm_lang$navigation$Navigation$reloadPage = _elm_lang$navigation$Native_Navigation.reloadPage;
var _elm_lang$navigation$Navigation$setLocation = _elm_lang$navigation$Native_Navigation.setLocation;
var _elm_lang$navigation$Navigation_ops = _elm_lang$navigation$Navigation_ops || {};
_elm_lang$navigation$Navigation_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$navigation$Navigation$notify = F3(
	function (router, subs, location) {
		var send = function (_p1) {
			var _p2 = _p1;
			return A2(
				_elm_lang$core$Platform$sendToApp,
				router,
				_p2._0(location));
		};
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(_elm_lang$core$List$map, send, subs)),
			_elm_lang$core$Task$succeed(
				{ctor: '_Tuple0'}));
	});
var _elm_lang$navigation$Navigation$cmdHelp = F3(
	function (router, subs, cmd) {
		var _p3 = cmd;
		switch (_p3.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$go(_p3._0);
			case 'New':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$pushState(_p3._0));
			case 'Modify':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$replaceState(_p3._0));
			case 'Visit':
				return _elm_lang$navigation$Navigation$setLocation(_p3._0);
			default:
				return _elm_lang$navigation$Navigation$reloadPage(_p3._0);
		}
	});
var _elm_lang$navigation$Navigation$killPopWatcher = function (popWatcher) {
	var _p4 = popWatcher;
	if (_p4.ctor === 'Normal') {
		return _elm_lang$core$Process$kill(_p4._0);
	} else {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Process$kill(_p4._0),
			_elm_lang$core$Process$kill(_p4._1));
	}
};
var _elm_lang$navigation$Navigation$onSelfMsg = F3(
	function (router, location, state) {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			A3(_elm_lang$navigation$Navigation$notify, router, state.subs, location),
			_elm_lang$core$Task$succeed(state));
	});
var _elm_lang$navigation$Navigation$subscription = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$command = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$Location = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {href: a, host: b, hostname: c, protocol: d, origin: e, port_: f, pathname: g, search: h, hash: i, username: j, password: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$navigation$Navigation$State = F2(
	function (a, b) {
		return {subs: a, popWatcher: b};
	});
var _elm_lang$navigation$Navigation$init = _elm_lang$core$Task$succeed(
	A2(
		_elm_lang$navigation$Navigation$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing));
var _elm_lang$navigation$Navigation$Reload = function (a) {
	return {ctor: 'Reload', _0: a};
};
var _elm_lang$navigation$Navigation$reload = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(false));
var _elm_lang$navigation$Navigation$reloadAndSkipCache = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(true));
var _elm_lang$navigation$Navigation$Visit = function (a) {
	return {ctor: 'Visit', _0: a};
};
var _elm_lang$navigation$Navigation$load = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Visit(url));
};
var _elm_lang$navigation$Navigation$Modify = function (a) {
	return {ctor: 'Modify', _0: a};
};
var _elm_lang$navigation$Navigation$modifyUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Modify(url));
};
var _elm_lang$navigation$Navigation$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_lang$navigation$Navigation$newUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$New(url));
};
var _elm_lang$navigation$Navigation$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$navigation$Navigation$back = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(0 - n));
};
var _elm_lang$navigation$Navigation$forward = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(n));
};
var _elm_lang$navigation$Navigation$cmdMap = F2(
	function (_p5, myCmd) {
		var _p6 = myCmd;
		switch (_p6.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$Jump(_p6._0);
			case 'New':
				return _elm_lang$navigation$Navigation$New(_p6._0);
			case 'Modify':
				return _elm_lang$navigation$Navigation$Modify(_p6._0);
			case 'Visit':
				return _elm_lang$navigation$Navigation$Visit(_p6._0);
			default:
				return _elm_lang$navigation$Navigation$Reload(_p6._0);
		}
	});
var _elm_lang$navigation$Navigation$Monitor = function (a) {
	return {ctor: 'Monitor', _0: a};
};
var _elm_lang$navigation$Navigation$program = F2(
	function (locationToMessage, stuff) {
		var init = stuff.init(
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$program(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$programWithFlags = F2(
	function (locationToMessage, stuff) {
		var init = function (flags) {
			return A2(
				stuff.init,
				flags,
				_elm_lang$navigation$Native_Navigation.getLocation(
					{ctor: '_Tuple0'}));
		};
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$programWithFlags(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$subMap = F2(
	function (func, _p7) {
		var _p8 = _p7;
		return _elm_lang$navigation$Navigation$Monitor(
			function (_p9) {
				return func(
					_p8._0(_p9));
			});
	});
var _elm_lang$navigation$Navigation$InternetExplorer = F2(
	function (a, b) {
		return {ctor: 'InternetExplorer', _0: a, _1: b};
	});
var _elm_lang$navigation$Navigation$Normal = function (a) {
	return {ctor: 'Normal', _0: a};
};
var _elm_lang$navigation$Navigation$spawnPopWatcher = function (router) {
	var reportLocation = function (_p10) {
		return A2(
			_elm_lang$core$Platform$sendToSelf,
			router,
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
	};
	return _elm_lang$navigation$Native_Navigation.isInternetExplorer11(
		{ctor: '_Tuple0'}) ? A3(
		_elm_lang$core$Task$map2,
		_elm_lang$navigation$Navigation$InternetExplorer,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)),
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'hashchange', _elm_lang$core$Json_Decode$value, reportLocation))) : A2(
		_elm_lang$core$Task$map,
		_elm_lang$navigation$Navigation$Normal,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)));
};
var _elm_lang$navigation$Navigation$onEffects = F4(
	function (router, cmds, subs, _p11) {
		var _p12 = _p11;
		var _p15 = _p12.popWatcher;
		var stepState = function () {
			var _p13 = {ctor: '_Tuple2', _0: subs, _1: _p15};
			_v6_2:
			do {
				if (_p13._0.ctor === '[]') {
					if (_p13._1.ctor === 'Just') {
						return A2(
							_elm_lang$navigation$Navigation_ops['&>'],
							_elm_lang$navigation$Navigation$killPopWatcher(_p13._1._0),
							_elm_lang$core$Task$succeed(
								A2(_elm_lang$navigation$Navigation$State, subs, _elm_lang$core$Maybe$Nothing)));
					} else {
						break _v6_2;
					}
				} else {
					if (_p13._1.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Task$map,
							function (_p14) {
								return A2(
									_elm_lang$navigation$Navigation$State,
									subs,
									_elm_lang$core$Maybe$Just(_p14));
							},
							_elm_lang$navigation$Navigation$spawnPopWatcher(router));
					} else {
						break _v6_2;
					}
				}
			} while(false);
			return _elm_lang$core$Task$succeed(
				A2(_elm_lang$navigation$Navigation$State, subs, _p15));
		}();
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					A2(_elm_lang$navigation$Navigation$cmdHelp, router, subs),
					cmds)),
			stepState);
	});
_elm_lang$core$Native_Platform.effectManagers['Navigation'] = {pkg: 'elm-lang/navigation', init: _elm_lang$navigation$Navigation$init, onEffects: _elm_lang$navigation$Navigation$onEffects, onSelfMsg: _elm_lang$navigation$Navigation$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$navigation$Navigation$cmdMap, subMap: _elm_lang$navigation$Navigation$subMap};

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _aforemny$ncms$Native_Json = function() {


function expose(value) {

    var result = { ctor: "Null" };
    if (typeof value === "boolean") {
        result = { ctor: "Bool", _0: value };
    }
    if (typeof value === "number") {
        result = { ctor: "Number", _0: value };
    }
    if (typeof value === "string") {
        result = { ctor: "String", _0: value };
    }
    if ((typeof value === "object")) {
        if (Array.isArray(value)) {
            var elements = _elm_lang$core$Native_List.Nil;
            for (var element in value) {
                elements =
                    _elm_lang$core$Native_List.Cons(expose(element), elements);
            }
            result = { ctor: "List", _0: elements };
        } else {
            var elements = _elm_lang$core$Native_List.Nil;
            for (var key in value) {
                var tuple =
                    _elm_lang$core$Native_Utils.Tuple2(
                        key,
                        expose(value[key]),
                    );
                elements =
                    _elm_lang$core$Native_List.Cons(tuple, elements);
            }
            result = { ctor: "Object", _0: _elm_lang$core$Dict$fromList(elements) };
        }
    }
    return result;
}

return {
	expose: expose
};

}();

var _aforemny$ncms$Value$expose = _aforemny$ncms$Native_Json.expose;
var _aforemny$ncms$Value$Object = function (a) {
	return {ctor: 'Object', _0: a};
};
var _aforemny$ncms$Value$List = function (a) {
	return {ctor: 'List', _0: a};
};
var _aforemny$ncms$Value$Number = function (a) {
	return {ctor: 'Number', _0: a};
};
var _aforemny$ncms$Value$String = function (a) {
	return {ctor: 'String', _0: a};
};
var _aforemny$ncms$Value$Bool = function (a) {
	return {ctor: 'Bool', _0: a};
};
var _aforemny$ncms$Value$Null = {ctor: 'Null'};

var _aforemny$ncms$Main$handle = F3(
	function (fail, succeed, result) {
		var _p0 = result;
		if (_p0.ctor === 'Ok') {
			return succeed(_p0._0);
		} else {
			return fail(_p0._0);
		}
	});
var _aforemny$ncms$Main$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$none;
};
var _aforemny$ncms$Main$toHash = function (page) {
	var _p1 = page;
	switch (_p1.ctor) {
		case 'Dashboard':
			return '';
		case 'Listing':
			return A2(_elm_lang$core$Basics_ops['++'], '#', _p1._0);
		case 'New':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'#',
				A2(_elm_lang$core$Basics_ops['++'], _p1._0, '/new'));
		case 'Edit':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'#',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_p1._0,
					A2(_elm_lang$core$Basics_ops['++'], '/edit/', _p1._1)));
		default:
			return _p1._0;
	}
};
var _aforemny$ncms$Main$defaultApiModel = {
	mdl: _aforemny$ncms$Material$defaultModel,
	value: _elm_lang$core$Json_Encode$null,
	values: {ctor: '[]'},
	inputs: _elm_lang$core$Dict$empty
};
var _aforemny$ncms$Main$redirect = _elm_lang$core$Native_Platform.outgoingPort(
	'redirect',
	function (v) {
		return v;
	});
var _aforemny$ncms$Main$cacheAccessToken = _elm_lang$core$Native_Platform.outgoingPort(
	'cacheAccessToken',
	function (v) {
		return v;
	});
var _aforemny$ncms$Main$clearAccessToken = _elm_lang$core$Native_Platform.outgoingPort(
	'clearAccessToken',
	function (v) {
		return null;
	});
var _aforemny$ncms$Main$cacheClientCredentials = _elm_lang$core$Native_Platform.outgoingPort(
	'cacheClientCredentials',
	function (v) {
		return {
			clientId: v.clientId,
			clientSecret: v.clientSecret,
			redirectUrl: (v.redirectUrl.ctor === 'Nothing') ? null : v.redirectUrl._0
		};
	});
var _aforemny$ncms$Main$clearClientCredentials = _elm_lang$core$Native_Platform.outgoingPort(
	'clearClientCredentials',
	function (v) {
		return null;
	});
var _aforemny$ncms$Main$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return {mdl: a, apis: b, error: c, page: d, clientId: e, clientSecret: f, auth: g, accessToken: h, user: i, loginProcess: j};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _aforemny$ncms$Main$ApiModel = F4(
	function (a, b, c, d) {
		return {mdl: a, value: b, values: c, inputs: d};
	});
var _aforemny$ncms$Main$TestTree = function (a) {
	return {ctor: 'TestTree', _0: a};
};
var _aforemny$ncms$Main$UserProfile = function (a) {
	return {ctor: 'UserProfile', _0: a};
};
var _aforemny$ncms$Main$Authenticate = function (a) {
	return {ctor: 'Authenticate', _0: a};
};
var _aforemny$ncms$Main$InputClientSecret = function (a) {
	return {ctor: 'InputClientSecret', _0: a};
};
var _aforemny$ncms$Main$InputClientId = function (a) {
	return {ctor: 'InputClientId', _0: a};
};
var _aforemny$ncms$Main$Login = {ctor: 'Login'};
var _aforemny$ncms$Main$Navigate = function (a) {
	return {ctor: 'Navigate', _0: a};
};
var _aforemny$ncms$Main$Error = function (a) {
	return {ctor: 'Error', _0: a};
};
var _aforemny$ncms$Main$ApiMsg = F2(
	function (a, b) {
		return {ctor: 'ApiMsg', _0: a, _1: b};
	});
var _aforemny$ncms$Main$Mdl = function (a) {
	return {ctor: 'Mdl', _0: a};
};
var _aforemny$ncms$Main$DeleteOk = function (a) {
	return {ctor: 'DeleteOk', _0: a};
};
var _aforemny$ncms$Main$Delete = function (a) {
	return {ctor: 'Delete', _0: a};
};
var _aforemny$ncms$Main$Cancel = {ctor: 'Cancel'};
var _aforemny$ncms$Main$SaveOk = function (a) {
	return {ctor: 'SaveOk', _0: a};
};
var _aforemny$ncms$Main$Save = {ctor: 'Save'};
var _aforemny$ncms$Main$Get = function (a) {
	return {ctor: 'Get', _0: a};
};
var _aforemny$ncms$Main$ApiMdl = function (a) {
	return {ctor: 'ApiMdl', _0: a};
};
var _aforemny$ncms$Main$Input = F2(
	function (a, b) {
		return {ctor: 'Input', _0: a, _1: b};
	});
var _aforemny$ncms$Main$editView = F3(
	function (lift, _p2, model) {
		var _p3 = _p2;
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'padding', _1: '32px'},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(
					_aforemny$ncms$Material_Options$styled,
					_elm_lang$html$Html$h1,
					{
						ctor: '::',
						_0: _aforemny$ncms$Material_Typography$title,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(_p3.type_),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Card$view,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Card$primary,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A3(
										_aforemny$ncms$Material_Options$styled,
										_elm_lang$html$Html$div,
										{ctor: '[]'},
										function (_p4) {
											return _elm_lang$core$List$concat(
												A2(
													_elm_lang$core$List$indexedMap,
													F2(
														function (i, _p5) {
															var _p6 = _p5;
															var _p12 = _p6._0;
															return {
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$label,
																	{ctor: '[]'},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text(_p12),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: function () {
																		var _p7 = _p6._1;
																		return A5(
																			_aforemny$ncms$Material_Textfield$render,
																			function (_p8) {
																				return lift(
																					_aforemny$ncms$Main$ApiMdl(_p8));
																			},
																			{
																				ctor: '::',
																				_0: 1,
																				_1: {
																					ctor: '::',
																					_0: 0,
																					_1: {
																						ctor: '::',
																						_0: i,
																						_1: {ctor: '[]'}
																					}
																				}
																			},
																			model.mdl,
																			{
																				ctor: '::',
																				_0: _aforemny$ncms$Material_Options$onInput(
																					function (_p9) {
																						return lift(
																							A2(_aforemny$ncms$Main$Input, _p12, _p9));
																					}),
																				_1: {
																					ctor: '::',
																					_0: _aforemny$ncms$Material_Textfield$value(
																						A2(
																							_elm_lang$core$Maybe$withDefault,
																							function () {
																								var _p10 = _aforemny$ncms$Value$expose(model.value);
																								if (_p10.ctor === 'Object') {
																									var _p11 = A2(_elm_lang$core$Dict$get, _p12, _p10._0);
																									if (_p11.ctor === 'Just') {
																										switch (_p11._0.ctor) {
																											case 'Null':
																												return '';
																											case 'Bool':
																												return _elm_lang$core$Basics$toString(_p11._0._0);
																											case 'String':
																												return _p11._0._0;
																											case 'Number':
																												return _elm_lang$core$Basics$toString(_p11._0._0);
																											case 'List':
																												return _elm_lang$core$Basics$toString(_p11._0._0);
																											default:
																												return _elm_lang$core$Basics$toString(_p11._0._0);
																										}
																									} else {
																										return '';
																									}
																								} else {
																									return '';
																								}
																							}(),
																							A2(_elm_lang$core$Dict$get, _p12, model.inputs))),
																					_1: {
																						ctor: '::',
																						_0: _aforemny$ncms$Material_Textfield$fullWidth,
																						_1: {
																							ctor: '::',
																							_0: A2(_aforemny$ncms$Material_Options$css, 'margin-bottom', '32px'),
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			},
																			{ctor: '[]'});
																	}(),
																	_1: {ctor: '[]'}
																}
															};
														}),
													_p4));
										}(_p3.fields)),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Card$actions,
									{
										ctor: '::',
										_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'flex'),
										_1: {
											ctor: '::',
											_0: A2(_aforemny$ncms$Material_Options$css, 'flex-flow', 'row-reverse'),
											_1: {ctor: '[]'}
										}
									},
									{
										ctor: '::',
										_0: A5(
											_aforemny$ncms$Material_Button$render,
											function (_p13) {
												return lift(
													_aforemny$ncms$Main$ApiMdl(_p13));
											},
											{
												ctor: '::',
												_0: 1,
												_1: {
													ctor: '::',
													_0: 1,
													_1: {
														ctor: '::',
														_0: 0,
														_1: {ctor: '[]'}
													}
												}
											},
											model.mdl,
											{
												ctor: '::',
												_0: _aforemny$ncms$Material_Options$onClick(
													lift(_aforemny$ncms$Main$Save)),
												_1: {
													ctor: '::',
													_0: _aforemny$ncms$Material_Button$primary,
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Save'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A5(
												_aforemny$ncms$Material_Button$render,
												function (_p14) {
													return lift(
														_aforemny$ncms$Main$ApiMdl(_p14));
												},
												{
													ctor: '::',
													_0: 1,
													_1: {
														ctor: '::',
														_0: 1,
														_1: {
															ctor: '::',
															_0: 0,
															_1: {ctor: '[]'}
														}
													}
												},
												model.mdl,
												{
													ctor: '::',
													_0: _aforemny$ncms$Material_Options$onClick(
														lift(_aforemny$ncms$Main$Cancel)),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Cancel'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _aforemny$ncms$Main$List = function (a) {
	return {ctor: 'List', _0: a};
};
var _aforemny$ncms$Main$pageInit = F2(
	function (model, page) {
		var _p15 = page;
		switch (_p15.ctor) {
			case 'Listing':
				var _p18 = _p15._0;
				var api = _elm_lang$core$List$head(
					A2(
						_elm_lang$core$List$filter,
						function (api) {
							return _elm_lang$core$Native_Utils.eq(api.type_, _p18);
						},
						_aforemny$ncms$Api$apis));
				var _p16 = api;
				if (_p16.ctor === 'Just') {
					return {
						ctor: '::',
						_0: A4(
							_p16._0.api.list,
							A2(
								_aforemny$ncms$Main$handle,
								_aforemny$ncms$Main$Error,
								function (_p17) {
									return A2(
										_aforemny$ncms$Main$ApiMsg,
										_p18,
										_aforemny$ncms$Main$List(_p17));
								}),
							A2(_elm_lang$core$Maybe$withDefault, '', model.accessToken),
							'aforemny',
							'ncms'),
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			case 'Edit':
				var _p21 = _p15._0;
				var api = _elm_lang$core$List$head(
					A2(
						_elm_lang$core$List$filter,
						function (api) {
							return _elm_lang$core$Native_Utils.eq(api.type_, _p21);
						},
						_aforemny$ncms$Api$apis));
				var _p19 = api;
				if (_p19.ctor === 'Just') {
					return {
						ctor: '::',
						_0: A2(
							_p19._0.api.get,
							A2(
								_aforemny$ncms$Main$handle,
								_aforemny$ncms$Main$Error,
								function (_p20) {
									return A2(
										_aforemny$ncms$Main$ApiMsg,
										_p21,
										_aforemny$ncms$Main$Get(_p20));
								}),
							_p15._1),
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			default:
				return {ctor: '[]'};
		}
	});
var _aforemny$ncms$Main$NotFound = function (a) {
	return {ctor: 'NotFound', _0: a};
};
var _aforemny$ncms$Main$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _aforemny$ncms$Main$listingView = F3(
	function (lift, api, model) {
		var fromValue = F2(
			function (fields, value) {
				return A2(
					_elm_lang$core$List$map,
					function (_p22) {
						var _p23 = _p22;
						var _p24 = value;
						if (_p24.ctor === 'Object') {
							return A2(
								_elm_lang$core$Maybe$withDefault,
								'',
								A2(
									_elm_lang$core$Maybe$map,
									function (v) {
										var _p25 = v;
										switch (_p25.ctor) {
											case 'Null':
												return 'null';
											case 'Bool':
												return _elm_lang$core$Basics$toString(_p25._0);
											case 'String':
												return _p25._0;
											case 'Number':
												return _elm_lang$core$Basics$toString(_p25._0);
											default:
												return _elm_lang$core$Basics$toString(v);
										}
									},
									A2(_elm_lang$core$Dict$get, _p23._0, _p24._0)));
						} else {
							return '';
						}
					},
					fields);
			});
		var rowStyle = {
			ctor: '::',
			_0: _aforemny$ncms$Material_Options$cs('row'),
			_1: {
				ctor: '::',
				_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'flex'),
				_1: {
					ctor: '::',
					_0: A2(_aforemny$ncms$Material_Options$css, 'flex-flow', 'row'),
					_1: {
						ctor: '::',
						_0: A2(_aforemny$ncms$Material_Options$css, 'flex', '1 1 auto'),
						_1: {ctor: '[]'}
					}
				}
			}
		};
		var fieldsRow = F3(
			function (id, options, strs) {
				var columnWidth = A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						100 / _elm_lang$core$Basics$toFloat(
							1 + _elm_lang$core$List$length(strs))),
					'%');
				return A2(
					_aforemny$ncms$Material_List$li,
					options,
					{
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_List$text,
							rowStyle,
							_elm_lang$core$List$concat(
								{
									ctor: '::',
									_0: A2(
										_elm_lang$core$List$map,
										function (str) {
											return A3(
												_aforemny$ncms$Material_Options$styled,
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: A2(_aforemny$ncms$Material_Options$css, 'width', columnWidth),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text(str),
													_1: {ctor: '[]'}
												});
										},
										strs),
									_1: {
										ctor: '::',
										_0: {
											ctor: '::',
											_0: A3(
												_aforemny$ncms$Material_Options$styled,
												_elm_lang$html$Html$div,
												{
													ctor: '::',
													_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'flex'),
													_1: {
														ctor: '::',
														_0: A2(_aforemny$ncms$Material_Options$css, 'flex-flow', 'row'),
														_1: {
															ctor: '::',
															_0: A2(_aforemny$ncms$Material_Options$css, 'width', columnWidth),
															_1: {ctor: '[]'}
														}
													}
												},
												{
													ctor: '::',
													_0: A3(
														_aforemny$ncms$Material_Options$styled,
														_elm_lang$html$Html$i,
														{
															ctor: '::',
															_0: function () {
																var _p26 = id;
																if (_p26.ctor === 'Just') {
																	return _aforemny$ncms$Material_Options$onClick(
																		_aforemny$ncms$Main$Navigate(
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				'#',
																				A2(
																					_elm_lang$core$Basics_ops['++'],
																					api.type_,
																					A2(_elm_lang$core$Basics_ops['++'], '/edit/', _p26._0)))));
																} else {
																	return _aforemny$ncms$Material_Options$nop;
																}
															}(),
															_1: {
																ctor: '::',
																_0: _aforemny$ncms$Material_Options$cs('material-icons'),
																_1: {ctor: '[]'}
															}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('edit'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A3(
															_aforemny$ncms$Material_Options$styled,
															_elm_lang$html$Html$i,
															{
																ctor: '::',
																_0: function () {
																	var _p27 = id;
																	if (_p27.ctor === 'Just') {
																		return _aforemny$ncms$Material_Options$onClick(
																			lift(
																				_aforemny$ncms$Main$Delete(_p27._0)));
																	} else {
																		return _aforemny$ncms$Material_Options$nop;
																	}
																}(),
																_1: {
																	ctor: '::',
																	_0: _aforemny$ncms$Material_Options$cs('material-icons'),
																	_1: {ctor: '[]'}
																}
															},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text('delete'),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}
												}),
											_1: {ctor: '[]'}
										},
										_1: {ctor: '[]'}
									}
								})),
						_1: {ctor: '[]'}
					});
			});
		var listingFields = function (fields) {
			return A2(
				_aforemny$ncms$Material_List$ul,
				{ctor: '[]'},
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: {
							ctor: '::',
							_0: A3(
								fieldsRow,
								_elm_lang$core$Maybe$Nothing,
								{
									ctor: '::',
									_0: A2(_aforemny$ncms$Material_Options$css, 'color', '#ccc'),
									_1: {ctor: '[]'}
								},
								A2(
									_elm_lang$core$List$map,
									function (_p28) {
										var _p29 = _p28;
										return _p29._0;
									},
									fields)),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_List$divider,
									{ctor: '[]'},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						},
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$core$List$map,
								function (value) {
									var id = function () {
										var _p30 = _aforemny$ncms$Value$expose(value);
										if (_p30.ctor === 'Object') {
											return A2(
												_elm_lang$core$Maybe$withDefault,
												'',
												A2(
													_elm_lang$core$Maybe$map,
													function (v) {
														var _p31 = v;
														if (_p31.ctor === 'String') {
															return _p31._0;
														} else {
															return '';
														}
													},
													A2(_elm_lang$core$Dict$get, api.idField, _p30._0)));
										} else {
											return '';
										}
									}();
									return A3(
										fieldsRow,
										_elm_lang$core$Maybe$Just(id),
										{ctor: '[]'},
										A2(
											fromValue,
											fields,
											_aforemny$ncms$Value$expose(value)));
								},
								model.values),
							_1: {ctor: '[]'}
						}
					}));
		};
		var listingType = function (_p32) {
			var _p33 = _p32;
			var _p35 = _p33.type_;
			return A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_aforemny$ncms$Material_Card$view,
						{
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Options$css, 'width', '1200px'),
							_1: {
								ctor: '::',
								_0: A2(_aforemny$ncms$Material_Options$css, 'max-width', '100%'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Card$primary,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Card$title,
										{
											ctor: '::',
											_0: _aforemny$ncms$Material_Card$large,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(_p35),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A2(
									_aforemny$ncms$Material_Card$supportingText,
									{ctor: '[]'},
									{
										ctor: '::',
										_0: listingFields(_p33.fields),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Card$actions,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: A5(
												_aforemny$ncms$Material_Button$render,
												function (_p34) {
													return lift(
														_aforemny$ncms$Main$ApiMdl(_p34));
												},
												{
													ctor: '::',
													_0: 0,
													_1: {
														ctor: '::',
														_0: 1,
														_1: {
															ctor: '::',
															_0: 2,
															_1: {
																ctor: '::',
																_0: 3,
																_1: {ctor: '[]'}
															}
														}
													}
												},
												model.mdl,
												{
													ctor: '::',
													_0: _aforemny$ncms$Material_Options$onClick(
														_aforemny$ncms$Main$Navigate(
															_aforemny$ncms$Main$toHash(
																_aforemny$ncms$Main$New(_p35)))),
													_1: {
														ctor: '::',
														_0: _aforemny$ncms$Material_Button$accent,
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('New'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {ctor: '[]'}
				});
		};
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'font-size', _1: '16px'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'padding', _1: '32px'},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$List$map,
						function (type_) {
							return listingType(type_);
						},
						api.types),
					_1: {ctor: '[]'}
				}));
	});
var _aforemny$ncms$Main$Edit = F2(
	function (a, b) {
		return {ctor: 'Edit', _0: a, _1: b};
	});
var _aforemny$ncms$Main$Listing = function (a) {
	return {ctor: 'Listing', _0: a};
};
var _aforemny$ncms$Main$apiUpdate = F5(
	function (accessToken, _p36, lift, msg, model) {
		var _p37 = _p36;
		var _p59 = _p37.type_;
		var _p58 = _p37.api;
		var value = function (tehtype) {
			var _p38 = tehtype;
			if (_p38.ctor === 'Just') {
				return _elm_lang$core$Json_Encode$object(
					A2(
						_elm_lang$core$List$map,
						function (_p39) {
							var _p40 = _p39;
							var _p53 = _p40._1;
							var _p52 = _p40._0;
							var fromValue = F2(
								function (typeRep, value) {
									var _p41 = typeRep;
									switch (_p41) {
										case 'Bool':
											var _p42 = value;
											if (_p42.ctor === 'Bool') {
												return _elm_lang$core$Json_Encode$bool(_p42._0);
											} else {
												return _elm_lang$core$Native_Utils.crashCase(
													'Main',
													{
														start: {line: 455, column: 43},
														end: {line: 459, column: 74}
													},
													_p42)('fromValue');
											}
										case 'String':
											var _p44 = value;
											if (_p44.ctor === 'String') {
												return _elm_lang$core$Json_Encode$string(_p44._0);
											} else {
												return _elm_lang$core$Native_Utils.crashCase(
													'Main',
													{
														start: {line: 461, column: 43},
														end: {line: 465, column: 74}
													},
													_p44)('fromValue');
											}
										case 'List (String)':
											var _p46 = value;
											if (_p46.ctor === 'List') {
												return _elm_lang$core$Json_Encode$list(
													A2(
														_elm_lang$core$List$map,
														fromValue('String'),
														_p46._0));
											} else {
												return _elm_lang$core$Native_Utils.crashCase(
													'Main',
													{
														start: {line: 467, column: 43},
														end: {line: 472, column: 74}
													},
													_p46)('fromValue');
											}
										default:
											return _elm_lang$core$Json_Encode$null;
									}
								});
							var fromString = function (str) {
								var _p48 = _p53;
								switch (_p48) {
									case 'String':
										return _elm_lang$core$Json_Encode$string(str);
									case 'Maybe (String)':
										return (!_elm_lang$core$Native_Utils.eq(str, '')) ? _elm_lang$core$Json_Encode$string(str) : _elm_lang$core$Json_Encode$null;
									case 'List (String)':
										return _elm_lang$core$Json_Encode$list(
											{
												ctor: '::',
												_0: _elm_lang$core$Json_Encode$string(str),
												_1: {ctor: '[]'}
											});
									case 'Bool':
										return _elm_lang$core$Json_Encode$bool(
											_elm_lang$core$Native_Utils.eq(str, 'True') ? true : false);
									default:
										return _elm_lang$core$Native_Utils.crashCase(
											'Main',
											{
												start: {line: 433, column: 35},
												end: {line: 450, column: 67}
											},
											_p48)('fromString');
								}
							};
							var _p50 = A2(_elm_lang$core$Dict$get, _p52, model.inputs);
							if (_p50.ctor === 'Just') {
								return {
									ctor: '_Tuple2',
									_0: _p52,
									_1: fromString(_p50._0)
								};
							} else {
								var _p51 = _aforemny$ncms$Value$expose(model.value);
								if (_p51.ctor === 'Object') {
									return A2(
										F2(
											function (v0, v1) {
												return {ctor: '_Tuple2', _0: v0, _1: v1};
											}),
										_p52,
										A2(
											_elm_lang$core$Maybe$withDefault,
											fromString(''),
											A2(
												_elm_lang$core$Maybe$map,
												fromValue(_p53),
												A2(_elm_lang$core$Dict$get, _p52, _p51._0))));
								} else {
									return {
										ctor: '_Tuple2',
										_0: _p52,
										_1: fromString('')
									};
								}
							}
						},
						_p38._0.fields));
			} else {
				return _elm_lang$core$Json_Encode$null;
			}
		};
		var handle_ = function (f) {
			return A2(
				_aforemny$ncms$Main$handle,
				_aforemny$ncms$Main$Error,
				function (_p54) {
					return lift(
						f(_p54));
				});
		};
		var id = function (value) {
			return '';
		};
		var _p55 = msg;
		switch (_p55.ctor) {
			case 'Cancel':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$back(1)
				};
			case 'List':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{values: _p55._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Get':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{value: _p55._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Delete':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: A2(
						_p58.$delete,
						handle_(_aforemny$ncms$Main$DeleteOk),
						_p55._0)
				};
			case 'DeleteOk':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: A4(
						_p58.list,
						handle_(_aforemny$ncms$Main$List),
						accessToken,
						'aforemny',
						'ncms')
				};
			case 'Input':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							inputs: A3(_elm_lang$core$Dict$insert, _p55._0, _p55._1, model.inputs)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ApiMdl':
				return A3(
					_aforemny$ncms$Material$update,
					function (_p56) {
						return lift(
							_aforemny$ncms$Main$ApiMdl(_p56));
					},
					_p55._0,
					model);
			case 'Save':
				var tehtype = _elm_lang$core$List$head(
					A2(
						_elm_lang$core$List$filter,
						function (t) {
							return _elm_lang$core$Native_Utils.eq(t.type_, _p59);
						},
						_p37.types));
				var value_ = value(tehtype);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{value: value_, inputs: _elm_lang$core$Dict$empty}),
					_1: A2(
						_p58.create,
						handle_(_aforemny$ncms$Main$SaveOk),
						value_)
				};
			default:
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: A2(
						_elm_lang$core$Task$perform,
						function (_p57) {
							return _aforemny$ncms$Main$Navigate(
								_aforemny$ncms$Main$toHash(
									_aforemny$ncms$Main$Listing(_p59)));
						},
						_elm_lang$core$Task$succeed(
							{ctor: '_Tuple0'}))
				};
		}
	});
var _aforemny$ncms$Main$Dashboard = {ctor: 'Dashboard'};
var _aforemny$ncms$Main$defaultPage = _aforemny$ncms$Main$Dashboard;
var _aforemny$ncms$Main$defaultModel = {mdl: _aforemny$ncms$Material$defaultModel, apis: _elm_lang$core$Dict$empty, error: _elm_lang$core$Maybe$Nothing, page: _aforemny$ncms$Main$defaultPage, clientId: '', clientSecret: '', auth: _elm_lang$core$Maybe$Nothing, accessToken: _elm_lang$core$Maybe$Nothing, user: _elm_lang$core$Maybe$Nothing, loginProcess: true};
var _aforemny$ncms$Main$fromHash = function (hash) {
	var _p60 = _elm_lang$core$String$uncons(hash);
	if (_p60.ctor === 'Nothing') {
		return _aforemny$ncms$Main$Dashboard;
	} else {
		if ((_p60._0.ctor === '_Tuple2') && (_p60._0._0.valueOf() === '#')) {
			if (_p60._0._1 === '') {
				return _aforemny$ncms$Main$Dashboard;
			} else {
				var _p61 = A2(_elm_lang$core$String$split, '/', _p60._0._1);
				_v31_2:
				do {
					if (_p61.ctor === '::') {
						if (_p61._1.ctor === '::') {
							switch (_p61._1._0) {
								case 'new':
									return _aforemny$ncms$Main$New(_p61._0);
								case 'edit':
									if (_p61._1._1.ctor === '::') {
										return A2(_aforemny$ncms$Main$Edit, _p61._0, _p61._1._1._0);
									} else {
										break _v31_2;
									}
								default:
									break _v31_2;
							}
						} else {
							break _v31_2;
						}
					} else {
						return _aforemny$ncms$Main$NotFound(hash);
					}
				} while(false);
				return _aforemny$ncms$Main$Listing(_p61._0);
			}
		} else {
			return _aforemny$ncms$Main$NotFound(hash);
		}
	}
};
var _aforemny$ncms$Main$init = F2(
	function (flags, location) {
		var page = _aforemny$ncms$Main$fromHash(location.hash);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				_aforemny$ncms$Main$defaultModel,
				{page: page, auth: flags.auth, accessToken: flags.accessToken, clientId: flags.clientId, clientSecret: flags.clientSecret}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: _elm_lang$core$Platform_Cmd$batch(
						A2(_aforemny$ncms$Main$pageInit, _aforemny$ncms$Main$defaultModel, page)),
					_1: {
						ctor: '::',
						_0: function () {
							var _p62 = {ctor: '_Tuple2', _0: flags.accessToken, _1: flags.auth};
							_v32_2:
							do {
								if (_p62.ctor === '_Tuple2') {
									if (_p62._0.ctor === 'Just') {
										var _p67 = _p62._0._0;
										return _elm_lang$core$Platform_Cmd$batch(
											{
												ctor: '::',
												_0: A2(
													_elm_lang$core$Task$attempt,
													function (result) {
														var _p63 = result;
														if (_p63.ctor === 'Ok') {
															return _aforemny$ncms$Main$UserProfile(_p63._0);
														} else {
															return _aforemny$ncms$Main$Error(_p63._0);
														}
													},
													_aforemny$ncms$Ncms_Github$user(_p67)),
												_1: {
													ctor: '::',
													_0: function () {
														var project = 'ncms';
														var owner = 'aforemny';
														return A2(
															_elm_lang$core$Task$attempt,
															function (result) {
																var _p64 = result;
																if (_p64.ctor === 'Ok') {
																	return _aforemny$ncms$Main$TestTree(_p64._0);
																} else {
																	return _aforemny$ncms$Main$Error(_p64._0);
																}
															},
															A2(
																_elm_lang$core$Task$andThen,
																function (_p65) {
																	var _p66 = _p65;
																	return _elm_lang$core$Task$sequence(
																		A2(
																			_elm_lang$core$List$map,
																			function (file) {
																				return A4(_aforemny$ncms$Ncms_Github$blob, _p67, owner, project, file.sha);
																			},
																			A2(
																				_elm_lang$core$List$filter,
																				function (file) {
																					return A2(
																						_elm_lang$core$Regex$contains,
																						_elm_lang$core$Regex$regex('^data/.*\\.json$'),
																						file.path);
																				},
																				_p66.tree)));
																},
																A2(
																	_elm_lang$core$Task$andThen,
																	function (reference) {
																		return A5(_aforemny$ncms$Ncms_Github$tree, _p67, true, owner, project, reference.object.sha);
																	},
																	A4(_aforemny$ncms$Ncms_Github$reference, _p67, owner, project, 'heads/gh-pages'))));
													}(),
													_1: {ctor: '[]'}
												}
											});
									} else {
										if (_p62._1.ctor === 'Just') {
											return A2(
												_elm_lang$http$Http$send,
												A2(_aforemny$ncms$Main$handle, _aforemny$ncms$Main$Error, _aforemny$ncms$Main$Authenticate),
												_elm_lang$http$Http$request(
													{
														method: 'POST',
														headers: {
															ctor: '::',
															_0: A2(_elm_lang$http$Http$header, 'Accept', 'application/json'),
															_1: {ctor: '[]'}
														},
														url: A2(
															_elm_lang$core$Basics_ops['++'],
															'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token?client_id=',
															A2(
																_elm_lang$core$Basics_ops['++'],
																flags.clientId,
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'&client_secret=',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		flags.clientSecret,
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			'&code=',
																			A2(_elm_lang$core$Basics_ops['++'], _p62._1._0.code, '&state=123')))))),
														body: _elm_lang$http$Http$emptyBody,
														expect: _elm_lang$http$Http$expectJson(
															A2(
																_elm_lang$core$Json_Decode$at,
																{
																	ctor: '::',
																	_0: 'access_token',
																	_1: {ctor: '[]'}
																},
																_elm_lang$core$Json_Decode$string)),
														timeout: _elm_lang$core$Maybe$Nothing,
														withCredentials: false
													}));
										} else {
											break _v32_2;
										}
									}
								} else {
									break _v32_2;
								}
							} while(false);
							return _elm_lang$core$Platform_Cmd$none;
						}(),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _aforemny$ncms$Main$update = F2(
	function (msg, model) {
		var _p68 = msg;
		switch (_p68.ctor) {
			case 'TestTree':
				var _p69 = A2(_elm_lang$core$Debug$log, 'tree', _p68._0);
				return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'Mdl':
				return A3(_aforemny$ncms$Material$update, _aforemny$ncms$Main$Mdl, _p68._0, model);
			case 'UserProfile':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							user: _elm_lang$core$Maybe$Just(_p68._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Authenticate':
				var _p71 = _p68._0;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							accessToken: _elm_lang$core$Maybe$Just(_p71)
						}),
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: _aforemny$ncms$Main$cacheAccessToken(_p71),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Task$attempt,
									function (result) {
										var _p70 = result;
										if (_p70.ctor === 'Ok') {
											return _aforemny$ncms$Main$UserProfile(_p70._0);
										} else {
											return _aforemny$ncms$Main$Error(_p70._0);
										}
									},
									_aforemny$ncms$Ncms_Github$user(_p71)),
								_1: {ctor: '[]'}
							}
						})
				};
			case 'Login':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: _aforemny$ncms$Main$cacheClientCredentials(
								{
									clientId: model.clientId,
									clientSecret: model.clientSecret,
									redirectUrl: _elm_lang$core$Maybe$Just(
										A2(
											_elm_lang$core$Basics_ops['++'],
											'https://github.com/login/oauth/authorize?client_id=',
											A2(_elm_lang$core$Basics_ops['++'], model.clientId, '&state=123')))
								}),
							_1: {ctor: '[]'}
						})
				};
			case 'InputClientId':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{clientId: _p68._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'InputClientSecret':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{clientSecret: _p68._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Navigate':
				var _p72 = _p68._0;
				var page = _aforemny$ncms$Main$fromHash(_p72);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{page: page}),
					_1: _elm_lang$core$Native_Utils.eq(model.page, page) ? _elm_lang$core$Platform_Cmd$none : _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: _elm_lang$navigation$Navigation$newUrl(
								_elm_lang$core$Native_Utils.eq(_p72, '') ? '#' : _p72),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Platform_Cmd$batch(
									A2(_aforemny$ncms$Main$pageInit, model, page)),
								_1: {ctor: '[]'}
							}
						})
				};
			case 'Error':
				var _p75 = _p68._0;
				var _p73 = A2(_elm_lang$core$Debug$log, 'error', _p75);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							error: _elm_lang$core$Maybe$Just(_p75)
						}),
					_1: function () {
						if (model.loginProcess) {
							var _p74 = _p75;
							if (_p74.ctor === 'BadStatus') {
								return _aforemny$ncms$Main$clearAccessToken(
									{ctor: '_Tuple0'});
							} else {
								return _elm_lang$core$Platform_Cmd$none;
							}
						} else {
							return _elm_lang$core$Platform_Cmd$none;
						}
					}()
				};
			default:
				var _p79 = _p68._0;
				var api_ = _elm_lang$core$List$head(
					A2(
						_elm_lang$core$List$filter,
						function (api) {
							return _elm_lang$core$Native_Utils.eq(api.type_, _p79) ? true : false;
						},
						_aforemny$ncms$Api$apis));
				var _p76 = api_;
				if (_p76.ctor === 'Just') {
					var apiModel = A2(
						_elm_lang$core$Maybe$withDefault,
						_aforemny$ncms$Main$defaultApiModel,
						A2(_elm_lang$core$Dict$get, _p79, model.apis));
					var _p77 = A5(
						_aforemny$ncms$Main$apiUpdate,
						A2(_elm_lang$core$Maybe$withDefault, '', model.accessToken),
						_p76._0,
						_aforemny$ncms$Main$ApiMsg(_p79),
						_p68._1,
						apiModel);
					var apiModel_ = _p77._0;
					var effects = _p77._1;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								apis: A3(_elm_lang$core$Dict$insert, _p79, apiModel_, model.apis)
							}),
						_1: effects
					};
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Main',
						{
							start: {line: 399, column: 17},
							end: {line: 414, column: 45}
						},
						_p76)('no api');
				}
		}
	});
var _aforemny$ncms$Main$view = function (model) {
	return _aforemny$ncms$Material$top(
		A3(
			_aforemny$ncms$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _aforemny$ncms$Material_Typography$typography,
				_1: {
					ctor: '::',
					_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'flex'),
					_1: {
						ctor: '::',
						_0: A2(_aforemny$ncms$Material_Options$css, 'flex-flow', 'row'),
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: A5(
					_aforemny$ncms$Material_Drawer_Permanent$render,
					_aforemny$ncms$Main$Mdl,
					{
						ctor: '::',
						_0: 0,
						_1: {ctor: '[]'}
					},
					model.mdl,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_aforemny$ncms$Material_Drawer_Permanent$toolbarSpacer,
							{ctor: '[]'},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Drawer_Permanent$content,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_List$group,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: A2(
												_aforemny$ncms$Material_List$subheader,
												{
													ctor: '::',
													_0: A2(_aforemny$ncms$Material_Options$css, 'padding-left', '24px'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('Ncms'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_List$ul,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: A2(
															_aforemny$ncms$Material_List$li,
															{
																ctor: '::',
																_0: _aforemny$ncms$Material_Options$onClick(
																	_aforemny$ncms$Main$Navigate(
																		_aforemny$ncms$Main$toHash(_aforemny$ncms$Main$Dashboard))),
																_1: {
																	ctor: '::',
																	_0: A2(_aforemny$ncms$Material_Options$css, 'cursor', 'pointer'),
																	_1: {ctor: '[]'}
																}
															},
															{
																ctor: '::',
																_0: A2(
																	_aforemny$ncms$Material_List$text,
																	{
																		ctor: '::',
																		_0: A2(_aforemny$ncms$Material_Options$css, 'padding-left', '36px'),
																		_1: {ctor: '[]'}
																	},
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html$text('Dashboard'),
																		_1: {ctor: '[]'}
																	}),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_List$subheader,
														{
															ctor: '::',
															_0: A2(_aforemny$ncms$Material_Options$css, 'padding-left', '24px'),
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Endpoints'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_aforemny$ncms$Material_List$ul,
															{ctor: '[]'},
															A2(
																_elm_lang$core$List$map,
																function (api) {
																	return A2(
																		_aforemny$ncms$Material_List$li,
																		{
																			ctor: '::',
																			_0: _aforemny$ncms$Material_Options$onClick(
																				_aforemny$ncms$Main$Navigate(
																					_aforemny$ncms$Main$toHash(
																						_aforemny$ncms$Main$Listing(api.type_)))),
																			_1: {
																				ctor: '::',
																				_0: A2(_aforemny$ncms$Material_Options$css, 'cursor', 'pointer'),
																				_1: {ctor: '[]'}
																			}
																		},
																		{
																			ctor: '::',
																			_0: A2(
																				_aforemny$ncms$Material_List$text,
																				{
																					ctor: '::',
																					_0: A2(_aforemny$ncms$Material_Options$css, 'padding-left', '36px'),
																					_1: {ctor: '[]'}
																				},
																				{
																					ctor: '::',
																					_0: _elm_lang$html$Html$text(api.type_),
																					_1: {ctor: '[]'}
																				}),
																			_1: {ctor: '[]'}
																		});
																},
																_aforemny$ncms$Api$apis)),
														_1: {ctor: '[]'}
													}
												}
											}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_aforemny$ncms$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'flex'),
							_1: {
								ctor: '::',
								_0: A2(_aforemny$ncms$Material_Options$css, 'flex-flow', 'column'),
								_1: {
									ctor: '::',
									_0: A2(_aforemny$ncms$Material_Options$css, 'flex-grow', '1'),
									_1: {ctor: '[]'}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_aforemny$ncms$Material_Toolbar$view,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_aforemny$ncms$Material_Toolbar$row,
										{ctor: '[]'},
										{
											ctor: '::',
											_0: A2(
												_aforemny$ncms$Material_Toolbar$title,
												{ctor: '[]'},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('ncms'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_aforemny$ncms$Material_Toolbar$section,
													{
														ctor: '::',
														_0: _aforemny$ncms$Material_Toolbar$alignEnd,
														_1: {ctor: '[]'}
													},
													{ctor: '[]'}),
												_1: {
													ctor: '::',
													_0: A2(
														_aforemny$ncms$Material_Toolbar$section,
														{
															ctor: '::',
															_0: _aforemny$ncms$Material_Toolbar$alignEnd,
															_1: {ctor: '[]'}
														},
														function () {
															var _p80 = model.user;
															if (_p80.ctor === 'Just') {
																var _p81 = _p80._0;
																return {
																	ctor: '::',
																	_0: A2(
																		_elm_lang$html$Html$img,
																		{
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$src(_p81.avatarUrl),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html_Attributes$style(
																					{
																						ctor: '::',
																						_0: {ctor: '_Tuple2', _0: 'width', _1: '42px'},
																						_1: {
																							ctor: '::',
																							_0: {ctor: '_Tuple2', _0: 'height', _1: '42px'},
																							_1: {
																								ctor: '::',
																								_0: {ctor: '_Tuple2', _0: 'border-radius', _1: '21px'},
																								_1: {
																									ctor: '::',
																									_0: {ctor: '_Tuple2', _0: 'align-self', _1: 'center'},
																									_1: {
																										ctor: '::',
																										_0: {ctor: '_Tuple2', _0: 'margin-right', _1: '16px'},
																										_1: {ctor: '[]'}
																									}
																								}
																							}
																						}
																					}),
																				_1: {ctor: '[]'}
																			}
																		},
																		{ctor: '[]'}),
																	_1: {
																		ctor: '::',
																		_0: A3(
																			_aforemny$ncms$Material_Options$styled,
																			_elm_lang$html$Html$div,
																			{
																				ctor: '::',
																				_0: A2(_aforemny$ncms$Material_Options$css, 'align-self', 'center'),
																				_1: {
																					ctor: '::',
																					_0: A2(_aforemny$ncms$Material_Options$css, 'margin-right', '32px'),
																					_1: {ctor: '[]'}
																				}
																			},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(_p81.name),
																				_1: {ctor: '[]'}
																			}),
																		_1: {ctor: '[]'}
																	}
																};
															} else {
																return {
																	ctor: '::',
																	_0: A3(
																		_aforemny$ncms$Material_Options$styled,
																		_elm_lang$html$Html$div,
																		{
																			ctor: '::',
																			_0: A2(_aforemny$ncms$Material_Options$css, 'width', '42px'),
																			_1: {
																				ctor: '::',
																				_0: A2(_aforemny$ncms$Material_Options$css, 'height', '42px'),
																				_1: {
																					ctor: '::',
																					_0: A2(_aforemny$ncms$Material_Options$css, 'border-radius', '21px'),
																					_1: {
																						ctor: '::',
																						_0: A2(_aforemny$ncms$Material_Options$css, 'align-self', 'center'),
																						_1: {
																							ctor: '::',
																							_0: A2(_aforemny$ncms$Material_Options$css, 'margin-right', '16px'),
																							_1: {
																								ctor: '::',
																								_0: A2(_aforemny$ncms$Material_Options$css, 'background-color', '#ccc'),
																								_1: {ctor: '[]'}
																							}
																						}
																					}
																				}
																			}
																		},
																		{ctor: '[]'}),
																	_1: {
																		ctor: '::',
																		_0: A3(
																			_aforemny$ncms$Material_Options$styled,
																			_elm_lang$html$Html$div,
																			{
																				ctor: '::',
																				_0: A2(_aforemny$ncms$Material_Options$css, 'align-self', 'center'),
																				_1: {
																					ctor: '::',
																					_0: A2(_aforemny$ncms$Material_Options$css, 'margin-right', '32px'),
																					_1: {
																						ctor: '::',
																						_0: A2(_aforemny$ncms$Material_Options$css, 'background-color', '#ccc'),
																						_1: {
																							ctor: '::',
																							_0: A2(_aforemny$ncms$Material_Options$css, 'height', '24px'),
																							_1: {
																								ctor: '::',
																								_0: A2(_aforemny$ncms$Material_Options$css, 'border-radius', '12px'),
																								_1: {
																									ctor: '::',
																									_0: A2(_aforemny$ncms$Material_Options$css, 'width', '160px'),
																									_1: {ctor: '[]'}
																								}
																							}
																						}
																					}
																				}
																			},
																			{ctor: '[]'}),
																		_1: {ctor: '[]'}
																	}
																};
															}
														}()),
													_1: {ctor: '[]'}
												}
											}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A3(
									_aforemny$ncms$Material_Options$styled,
									_elm_lang$html$Html$div,
									{
										ctor: '::',
										_0: A2(_aforemny$ncms$Material_Options$css, 'padding-left', '36px'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: function () {
											var _p82 = model.page;
											switch (_p82.ctor) {
												case 'Dashboard':
													return A2(
														_elm_lang$html$Html$div,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: A3(
																_aforemny$ncms$Material_Options$styled,
																_elm_lang$html$Html$h1,
																{
																	ctor: '::',
																	_0: _aforemny$ncms$Material_Typography$title,
																	_1: {ctor: '[]'}
																},
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html$text('Dashboard'),
																	_1: {ctor: '[]'}
																}),
															_1: {
																ctor: '::',
																_0: function () {
																	var _p83 = model.accessToken;
																	if (_p83.ctor === 'Nothing') {
																		return A2(
																			_aforemny$ncms$Material_Card$view,
																			{
																				ctor: '::',
																				_0: A2(_aforemny$ncms$Material_Options$css, 'max-width', '600px'),
																				_1: {ctor: '[]'}
																			},
																			{
																				ctor: '::',
																				_0: A2(
																					_aforemny$ncms$Material_Card$primary,
																					{ctor: '[]'},
																					{
																						ctor: '::',
																						_0: A2(
																							_aforemny$ncms$Material_Card$title,
																							{
																								ctor: '::',
																								_0: _aforemny$ncms$Material_Card$large,
																								_1: {ctor: '[]'}
																							},
																							{
																								ctor: '::',
																								_0: _elm_lang$html$Html$text('Login'),
																								_1: {ctor: '[]'}
																							}),
																						_1: {ctor: '[]'}
																					}),
																				_1: {
																					ctor: '::',
																					_0: A2(
																						_aforemny$ncms$Material_Card$supportingText,
																						{
																							ctor: '::',
																							_0: A2(_aforemny$ncms$Material_Options$css, 'display', 'flex'),
																							_1: {
																								ctor: '::',
																								_0: A2(_aforemny$ncms$Material_Options$css, 'flex-flow', 'column'),
																								_1: {ctor: '[]'}
																							}
																						},
																						{
																							ctor: '::',
																							_0: A2(
																								_elm_lang$html$Html$label,
																								{ctor: '[]'},
																								{
																									ctor: '::',
																									_0: _elm_lang$html$Html$text('Client Id:'),
																									_1: {ctor: '[]'}
																								}),
																							_1: {
																								ctor: '::',
																								_0: A5(
																									_aforemny$ncms$Material_Textfield$render,
																									_aforemny$ncms$Main$Mdl,
																									{
																										ctor: '::',
																										_0: 0,
																										_1: {
																											ctor: '::',
																											_0: 0,
																											_1: {
																												ctor: '::',
																												_0: 0,
																												_1: {
																													ctor: '::',
																													_0: 1,
																													_1: {ctor: '[]'}
																												}
																											}
																										}
																									},
																									model.mdl,
																									{
																										ctor: '::',
																										_0: _aforemny$ncms$Material_Options$onInput(_aforemny$ncms$Main$InputClientId),
																										_1: {
																											ctor: '::',
																											_0: _aforemny$ncms$Material_Textfield$value(model.clientId),
																											_1: {ctor: '[]'}
																										}
																									},
																									{ctor: '[]'}),
																								_1: {
																									ctor: '::',
																									_0: A2(
																										_elm_lang$html$Html$label,
																										{ctor: '[]'},
																										{
																											ctor: '::',
																											_0: _elm_lang$html$Html$text('Client Secret:'),
																											_1: {ctor: '[]'}
																										}),
																									_1: {
																										ctor: '::',
																										_0: A5(
																											_aforemny$ncms$Material_Textfield$render,
																											_aforemny$ncms$Main$Mdl,
																											{
																												ctor: '::',
																												_0: 0,
																												_1: {
																													ctor: '::',
																													_0: 0,
																													_1: {
																														ctor: '::',
																														_0: 0,
																														_1: {
																															ctor: '::',
																															_0: 2,
																															_1: {ctor: '[]'}
																														}
																													}
																												}
																											},
																											model.mdl,
																											{
																												ctor: '::',
																												_0: _aforemny$ncms$Material_Options$onInput(_aforemny$ncms$Main$InputClientSecret),
																												_1: {
																													ctor: '::',
																													_0: _aforemny$ncms$Material_Textfield$value(model.clientSecret),
																													_1: {ctor: '[]'}
																												}
																											},
																											{ctor: '[]'}),
																										_1: {
																											ctor: '::',
																											_0: A5(
																												_aforemny$ncms$Material_Button$render,
																												_aforemny$ncms$Main$Mdl,
																												{
																													ctor: '::',
																													_0: 0,
																													_1: {
																														ctor: '::',
																														_0: 0,
																														_1: {
																															ctor: '::',
																															_0: 0,
																															_1: {
																																ctor: '::',
																																_0: 3,
																																_1: {ctor: '[]'}
																															}
																														}
																													}
																												},
																												model.mdl,
																												{
																													ctor: '::',
																													_0: _aforemny$ncms$Material_Options$onClick(_aforemny$ncms$Main$Login),
																													_1: {
																														ctor: '::',
																														_0: _aforemny$ncms$Material_Button$raised,
																														_1: {
																															ctor: '::',
																															_0: _aforemny$ncms$Material_Button$accent,
																															_1: {ctor: '[]'}
																														}
																													}
																												},
																												{
																													ctor: '::',
																													_0: _elm_lang$html$Html$text('Sign in'),
																													_1: {ctor: '[]'}
																												}),
																											_1: {ctor: '[]'}
																										}
																									}
																								}
																							}
																						}),
																					_1: {ctor: '[]'}
																				}
																			});
																	} else {
																		return A2(
																			_aforemny$ncms$Material_Card$view,
																			{
																				ctor: '::',
																				_0: A2(_aforemny$ncms$Material_Options$css, 'max-width', '900px'),
																				_1: {ctor: '[]'}
																			},
																			{
																				ctor: '::',
																				_0: _elm_lang$html$Html$text(
																					_elm_lang$core$Basics$toString(model.user)),
																				_1: {ctor: '[]'}
																			});
																	}
																}(),
																_1: {ctor: '[]'}
															}
														});
												case 'New':
													var _p89 = _p82._0;
													var api = _elm_lang$core$List$head(
														A2(
															_elm_lang$core$List$filter,
															function (api) {
																return _elm_lang$core$Native_Utils.eq(api.type_, _p89);
															},
															_aforemny$ncms$Api$apis));
													var _p84 = api;
													if (_p84.ctor === 'Just') {
														var _p88 = _p84._0;
														var apiModel = A2(
															_elm_lang$core$Maybe$withDefault,
															_aforemny$ncms$Main$defaultApiModel,
															A2(_elm_lang$core$Dict$get, _p88.type_, model.apis));
														var _p87 = _elm_lang$core$List$head(
															A2(
																_elm_lang$core$List$filter,
																function (_p85) {
																	var _p86 = _p85;
																	return _elm_lang$core$Native_Utils.eq(_p86.type_, _p89);
																},
																_p88.types));
														if (_p87.ctor === 'Just') {
															return A3(
																_aforemny$ncms$Main$editView,
																_aforemny$ncms$Main$ApiMsg(_p88.type_),
																_p87._0,
																apiModel);
														} else {
															return _elm_lang$html$Html$text('type not found');
														}
													} else {
														return _elm_lang$html$Html$text('api not found');
													}
												case 'Edit':
													var _p95 = _p82._0;
													var api = _elm_lang$core$List$head(
														A2(
															_elm_lang$core$List$filter,
															function (api) {
																return _elm_lang$core$Native_Utils.eq(api.type_, _p95);
															},
															_aforemny$ncms$Api$apis));
													var _p90 = api;
													if (_p90.ctor === 'Just') {
														var _p94 = _p90._0;
														var apiModel = A2(
															_elm_lang$core$Maybe$withDefault,
															_aforemny$ncms$Main$defaultApiModel,
															A2(_elm_lang$core$Dict$get, _p94.type_, model.apis));
														var _p93 = _elm_lang$core$List$head(
															A2(
																_elm_lang$core$List$filter,
																function (_p91) {
																	var _p92 = _p91;
																	return _elm_lang$core$Native_Utils.eq(_p92.type_, _p95);
																},
																_p94.types));
														if (_p93.ctor === 'Just') {
															return A3(
																_aforemny$ncms$Main$editView,
																_aforemny$ncms$Main$ApiMsg(_p94.type_),
																_p93._0,
																apiModel);
														} else {
															return _elm_lang$html$Html$text('type not found');
														}
													} else {
														return _elm_lang$html$Html$text('api not found');
													}
												case 'Listing':
													var api = _elm_lang$core$List$head(
														A2(
															_elm_lang$core$List$filter,
															function (api) {
																return _elm_lang$core$Native_Utils.eq(api.type_, _p82._0);
															},
															_aforemny$ncms$Api$apis));
													var _p96 = api;
													if (_p96.ctor === 'Just') {
														var _p97 = _p96._0;
														var apiModel = A2(
															_elm_lang$core$Maybe$withDefault,
															_aforemny$ncms$Main$defaultApiModel,
															A2(_elm_lang$core$Dict$get, _p97.type_, model.apis));
														return A3(
															_aforemny$ncms$Main$listingView,
															_aforemny$ncms$Main$ApiMsg(_p97.type_),
															_p97,
															apiModel);
													} else {
														return _elm_lang$html$Html$text('api not found');
													}
												default:
													return A2(
														_elm_lang$html$Html$div,
														{ctor: '[]'},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('404'),
															_1: {ctor: '[]'}
														});
											}
										}(),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			}));
};
var _aforemny$ncms$Main$main = A2(
	_elm_lang$navigation$Navigation$programWithFlags,
	function (_p98) {
		return _aforemny$ncms$Main$Navigate(
			function (_) {
				return _.hash;
			}(_p98));
	},
	{init: _aforemny$ncms$Main$init, subscriptions: _aforemny$ncms$Main$subscriptions, update: _aforemny$ncms$Main$update, view: _aforemny$ncms$Main$view})(
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (accessToken) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (auth) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (clientId) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (clientSecret) {
									return _elm_lang$core$Json_Decode$succeed(
										{accessToken: accessToken, auth: auth, clientId: clientId, clientSecret: clientSecret});
								},
								A2(_elm_lang$core$Json_Decode$field, 'clientSecret', _elm_lang$core$Json_Decode$string));
						},
						A2(_elm_lang$core$Json_Decode$field, 'clientId', _elm_lang$core$Json_Decode$string));
				},
				A2(
					_elm_lang$core$Json_Decode$field,
					'auth',
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$core$Json_Decode$map,
									_elm_lang$core$Maybe$Just,
									A2(
										_elm_lang$core$Json_Decode$andThen,
										function (code) {
											return A2(
												_elm_lang$core$Json_Decode$andThen,
												function (state) {
													return _elm_lang$core$Json_Decode$succeed(
														{code: code, state: state});
												},
												A2(_elm_lang$core$Json_Decode$field, 'state', _elm_lang$core$Json_Decode$string));
										},
										A2(_elm_lang$core$Json_Decode$field, 'code', _elm_lang$core$Json_Decode$string))),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$field,
			'accessToken',
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _aforemny$ncms$Main$main !== 'undefined') {
    _aforemny$ncms$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

