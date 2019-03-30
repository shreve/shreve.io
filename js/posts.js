let initPosts = () => {
  let sortVal = (post) => {
    return post.getElementsByTagName('time')[0].getAttribute('datetime');
  }

  let sortFunc = (post1, post2) => {
    return sortVal(post2).localeCompare(sortVal(post1));
  }

  let sortPosts = (posts) => {
    posts = [].slice.call(posts).sort(sortFunc);
    let list = document.getElementsByClassName('blog-post-list')[0];

    for (let element of posts) {
      list.appendChild(element);
    }
  }

  sortPosts(document.getElementsByClassName('blog-post'));
};

export { initPosts };
