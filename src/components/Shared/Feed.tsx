/* TODO: Move this long comment to documentation
   Makes sure component is completely mounted and all matching html tags are present
   before adding additional components inside. Otherwise closing tags can be missed
   and classes incorrectly assigned to wrong HTML elements */

import { useEffect, useState } from "react";
import { useReactiveVar } from "@apollo/client";
import { Card, LinearProgress } from "@material-ui/core";

import { feedVar } from "../../apollo/client/localState";
import Post from "../Posts/Post";

interface Props {
  deletePost: (id: string) => void;
}

const List = ({ deletePost }: Props) => {
  const { items, loading: feedLoading } = useReactiveVar(feedVar);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (feedLoading)
    return (
      <Card>
        <LinearProgress />
      </Card>
    );

  return (
    <>
      {items.map((item) => {
        return (
          <Post
            post={item as ClientPost}
            deletePost={deletePost}
            key={item.id}
          />
        );
      })}
    </>
  );
};

export default List;
