import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  CardHeader,
  CardMedia,
  CardActionArea,
} from "@material-ui/core";

import ImagesList from "../Images/List";
import { IMAGES_BY_POST_ID } from "../../apollo/client/queries";
import UserAvatar from "../Users/Avatar";
import ItemMenu from "../Shared/ItemMenu";
import styles from "../../styles/Shared/Shared.module.scss";
import { ModelNames, ResourcePaths } from "../../constants/common";
import { GlobalPermissions } from "../../constants/role";
import {
  useCurrentUser,
  useHasPermissionGlobally,
  useUserById,
} from "../../hooks";
import { noCache, timeAgo } from "../../utils/clientIndex";
import CardFooter from "./CardFooter";

const useStyles = makeStyles({
  cardHeaderTitle: {
    marginLeft: -5,
  },
  bodyTypographyRoot: {
    marginTop: -12,
  },
});

interface Props {
  post: ClientPost;
  deletePost: (id: string) => void;
}

const Post = ({ post, deletePost }: Props) => {
  const { id, userId, body, createdAt } = post;
  const currentUser = useCurrentUser();
  const [canManagePostsGlobally] = useHasPermissionGlobally(
    GlobalPermissions.ManagePosts
  );
  const [user] = useUserById(userId);
  const [images, setImages] = useState<ClientImage[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const imagesRes = useQuery(IMAGES_BY_POST_ID, {
    variables: { postId: id },
    ...noCache,
  });
  const classes = useStyles();

  useEffect(() => {
    if (imagesRes.data) setImages(imagesRes.data.imagesByPostId);
  }, [imagesRes.data]);

  const ownPost = (): boolean => {
    if (currentUser && user && currentUser.id === user.id) return true;
    return false;
  };

  return (
    <div key={id}>
      <Card>
        <CardHeader
          avatar={<UserAvatar user={user} />}
          title={
            <>
              <Link href={`${ResourcePaths.User}${user?.name}`}>
                <a>{user?.name}</a>
              </Link>
              <Link href={`${ResourcePaths.Post}${id}`}>
                <a className={styles.timeAgo}>{timeAgo(createdAt)}</a>
              </Link>
            </>
          }
          action={
            <ItemMenu
              itemId={id}
              itemType={ModelNames.Post}
              anchorEl={menuAnchorEl}
              setAnchorEl={setMenuAnchorEl}
              deleteItem={deletePost}
              canEdit={ownPost()}
              canDelete={ownPost() || canManagePostsGlobally}
            />
          }
          classes={{ title: classes.cardHeaderTitle }}
        />

        {body && (
          <CardContent>
            <Typography className={classes.bodyTypographyRoot}>
              {body}
            </Typography>
          </CardContent>
        )}

        <CardActionArea>
          <CardMedia>
            <ImagesList images={images} />
          </CardMedia>
        </CardActionArea>

        {currentUser && <CardFooter postId={id} />}
      </Card>
    </div>
  );
};

export default Post;
