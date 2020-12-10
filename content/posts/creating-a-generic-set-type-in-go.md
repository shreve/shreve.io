---
title: Creating a generic set type in Go
description: Go doesn't have generics or a native set type. Let's create a generic
  set type!
tags:
- golang
- programming
date: 2020-11-11
---

**tl;dr:** `map[interface{}]struct{}` gives us the properties we want with a low
memory overhead. There's a great implementation of this idea (including thread
safety) at [dekarep/golang-set](https://github.com/deckarep/golang-set).

First things first, if you're not familiar, a set is a data structure that
maintains a unique collection of elements. They work similarly to other
collection types like vectors, but with a few special properties: In order to
maintain uniqueness, inserting an element that's already in the set does
nothing, and in order to make this check reasonable to do often, the
`Contains(el)` algorithm is as fast as possible. This is typically achieved by
arranging the elements in a way that they can be looked up, rather than
searching the list from start to finish, which yields a complexity of O(log n)
or even O(1) rather than O(n).

So how do we create this type in Go? It doesn't provide a native set type like
python or include one in it's STL like C++. It also has fairly clumsy generic
programming through `interface{}` and `unsafe.Pointer`, so creating this by
yourself could be overly complex or error-prone. The answer is that the desired
functionality is already hidden in plain sight in Go's map type. Go's maps are
hash tables, which gives them a constant time average key lookup complexity.
They also only allow one copy of each key, enforcing uniqueness. This makes
them a great foundation for building our set.

There is one more thing to consider here, though, which is memory usage. We
only care about the keys, but we also need a value for each one. What is the
best value to use when we don't care about it? If you're coming from a C
background, you might chose `1` because that's a small truthy value often used
as a sentinel. If you're more familiar with Go, you might choose `true` because
you know it's actually 1 bit rather than 8 bits for a small int. If you're even
more familiar with go, you'd choose an anonymous struct because it actually
allocates 0 bits while still representing a value in the Go runtime.

```go
import (
	"fmt"
	"unsafe"
)

func main() {
	fmt.Println("Sizeof int:", unsafe.Sizeof(1))
	fmt.Println("Sizeof bool:", unsafe.Sizeof(true))
	fmt.Println("Sizeof struct:", unsafe.Sizeof(struct{}{}))
}

// Sizeof int: 8
// Sizeof bool: 1
// Sizeof struct: 0
```

We now have everything we need to create our generic set.

First, we create a map which can hold anything and has an empty presence
sentinel.

```go
type Set map[interface{}]struct{}
var sentinel = struct{}{}
```

Then we can implement our set functions. One thing to note is the nice map
access function which returns 2 values: the thing you searched for, and a bool
indicating whether there was anything there. That makes these functions pretty
simple.

```go
func (s *Set) Contains(el interface{}) bool {
	_, found := (*s)[el]
	return found
}

func (s *Set) Add(el interface{}) bool {
	if s.Contains(el) {
		return false
	}
	(*s)[el] = sentinel
	return true
}

func (s *Set) Remove(el interface{}) {
	delete(*s, el)
}
```

So these are the very basics of a set, but we also need a way to fetch elements
back out. The simplest way would be to collect the keys into a slice.

```go
func (s *Set) ToSlice() []interface{} {
	keys := make([]interface{}, 0, len(*s))
	for elem, _ := range *s {
		keys = append(keys, elem)
	}
	return keys
}
```

This is where we see the downside to this type of generic programming. When we
get the elements back out, they lose their types, and we the programmer have to
keep track of that ourselves and assert what they are. To actually use these
elements, we have to perform a type assertion.

```go
set := make(Set)
set.Add("Hydrogen")
set.Add("Helium")
set.Add("Lithium")

for i, elem := range set.ToSlice() {
	fmt.Printf("Element %d: %s\n", i + 1, elem.(string))
}
```

Additionally, this assertion will cause a panic if used on any element not of
that type.

```go
set := make(Set)
set.Add("Hydrogen")
set.Add("Helium")
set.Add("Lithium")
set.Add(4)

for i, elem := range set.ToSlice() {
	fmt.Printf("Element %d: %s\n", i + 1, elem.(string))
}
// panic: interface conversion: interface {} is int, not string
```

So this leads us to a (potential) benefit of this approach, which is that you
actually can mix types within this container, you just need to make sure you
handle them appropriately when you pull them out.

```go
set := make(Set)
set.Add("Hydrogen")
set.Add("Helium")
set.Add("Lithium")
set.Add(4)

for i, elem := range set.ToSlice() {
	switch elem.(type) {
	case string:
		fmt.Printf("Element %d: %s\n", i+1, elem)
	case int:
		fmt.Printf("Element %d: atomic number %d\n", i+1, elem)
	default:
		fmt.Println("I don't know what this is")
	}
}
// Element 1: Lithium
// Element 2: atomic number 4
// Element 3: Hydrogen
// Element 4: Helium
```

Notice it handles the different types, but there's something else wrong now.
This brings us to the final point I wanted to talk about, which is that the
order of keys is not guaranteed. If you ever use a map and the order of keys is
important, you'll need to make sure to explicitly sort them on your own. Go's
`sort.Sort` may be useful, but isn't guaranteed to be the answer, especially
for cases like this.

As mentioned in the tl;dr at the beginning of this post, the library
[deckarep/golang-set](https://github.com/deckarep/golang-set) has implemented
this idea to it's fullest extent. They have support for a bunch of mathematical
set operations like Difference and Intersection as well as a thread safe
version of all the code. They also don't have any external libraries, so it's a
pretty light option. I would recommend using this library in basically all
cases. This article exists to explain the concept.
