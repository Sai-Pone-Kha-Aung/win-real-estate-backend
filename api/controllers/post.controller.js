import prisma from "../lib/prisma.js"
import jwt from "jsonwebtoken"

export const getPosts = async (req, res) => {
    const query = req.query;
    console.log(query)
    try{
        const posts = await prisma.post.findMany({
            where: {
                type: query.type || undefined,
                city: query.city || undefined,
                property: query.property || undefined,
                bedroom: parseInt(query.bedroom) || undefined,
                price: {
                    gte: parseInt(query.minPrice) || undefined,
                    lte: parseInt(query.maxPrice) || undefined,
                },
            },
        });
        //setTimeout(() => {
            res.status(200).json(posts);
        //}, 3000);

    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Failed to get posts"})
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try{
        const post = await prisma.post.findUnique({
            where: { id },
            include:{
                postDetail: true,
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    }
                }
            }

        });

        const token = req.cookies?.token;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
              if (!err) {
                const saved = await prisma.savedPost.findUnique({
                    where: {
                      userId_postId: {
                        postId: id,
                        userId: payload.id,
                      },
                    },
                  });
                 res.status(200).json({ ...post, isSaved: saved ? true : false });
                } 
            });
        } else {

            res.status(200).json({ ...post, isSaved: false });
        }
    } catch (error){
        console.log(error)
        res.status(500).json({message: "Failed to get post"})
    }
}

export const addPost = async (req, res) => {
    const body = req.body;
    const tokenUserId = req.userId;

    try{
        const newPost = await prisma.post.create({
            data: {
               ...body.postData,
               userId: tokenUserId,
               postDetail: {
                create: body.postDetail,
               }
                
            }
        });
        res.status(200).json(newPost);
    } catch (error){
        console.log(error)
        res.status(500).json({message: "Failed to add post"})
    }
}

export const updatePost = async (req, res) => {
    try{

    } catch (error){
        console.log(error)
        res.status(500).json({message: "Failed to update post"})
    }
}

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const tokenUserId = req.userId;

    try{
        const post = await prisma.post.findUnique({
            where: {id},
        });

        if (post.userId !== tokenUserId) {
            return res.status(403).json({ message: "Not Authorized!" });
        }
        
        await prisma.post.delete({
            where: {id},
        })

        res.status(200).json({message: "Post deleted"});
    } catch (error){
        console.log(error)
        res.status(500).json({message: "Failed to delete post"})
    }
}