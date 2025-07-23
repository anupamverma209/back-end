const Blog = require("../Models/Blog");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;

//file upload function to Cloudinary
async function fileUploadToCloudinary(file, folder, type) {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: type, // 'image' or 'video'
  });
}

// createBlog function to handle blog creation
exports.createBlog = async (req, res) => {
  try {
    const { title, content, summary, categories, tags, status } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required." });
    }

    const slug = slugify(title, { lower: true, strict: true });

    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Blog with similar title already exists.",
      });
    }
    if (!req.files.coverImage) {
      return res.status(400).json({
        success: false,
        message: "cover image require",
      });
    }
    let coverImage = {};
    if (req.files && req.files.coverImage) {
      const file = req.files.coverImage;
      const result = await fileUploadToCloudinary(
        file,
        "Achichiz/blogImage", // bas yaha aap blog ka folder de rahe hain
        "image"
      );
      coverImage.public_id = result.public_id;
      coverImage.url = result.secure_url;
    }

    const blog = new Blog({
      title,
      slug,
      content,
      summary,
      categories,
      tags,
      status,
      coverImage,
      author: req.user.id,
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("createBlog error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// updateBlog function to handle blog updates
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    // find existing blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const { title, content, summary, categories, tags, status } = req.body;

    // update fields if present
    if (title) {
      blog.title = title;
      blog.slug = slugify(title, { lower: true, strict: true });
    }
    if (content) blog.content = content;
    if (summary) blog.summary = summary;
    if (categories) blog.categories = categories;
    if (tags) blog.tags = tags;
    if (status) blog.status = status;

    // if new coverImage is sent
    if (req.files && req.files.coverImage) {
      // delete old image from Cloudinary
      if (blog.coverImage && blog.coverImage.public_id) {
        await cloudinary.uploader.destroy(blog.coverImage.public_id);
      }
      // upload new image
      const file = req.files.coverImage;
      const result = await fileUploadToCloudinary(
        file,
        "Achichiz/blogImage",
        "image"
      );
      blog.coverImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("updateBlog error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// deleteBlog function to handle blog deletion
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.body;

    // 1. find blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // 2. delete coverImage from Cloudinary
    if (blog.coverImage && blog.coverImage.public_id) {
      await cloudinary.uploader.destroy(blog.coverImage.public_id);
    }

    // 3. delete blog from DB
    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("deleteBlog error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get single blog by id

exports.getSingleBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ validate id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id",
      });
    }
    const blogviews = await Blog.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    // 2️⃣ find blog by ID
    const blog = await Blog.findById(id).populate(
      "comments.user",
      "name email"
    );
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // 3️⃣ related blogs
    // const relatedBlogs = await Blog.find({
    //   _id: { $ne: blog._id },
    //   $or: [
    //     { categories: { $in: blog.categories } },
    //     { tags: { $in: blog.tags } },
    //   ],
    //   status: "Published",
    // })
    //   .select("title slug coverImage createdAt")
    //   .limit(1);

    res.status(200).json({
      success: true,
      blog,
      blogviews,
    });
  } catch (error) {
    console.error("getSingleBlogById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get all blogs with pagination and filtering

exports.getAllBlogs = async (req, res) => {
  try {
    const {
      category,
      tags,
      author,
      status,
      isFeatured,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // dynamic filters
    if (category) {
      query.categories = category;
    }
    if (tags) {
      query.tags = { $in: tags.split(",") };
    }
    if (author) {
      query.author = author;
    }
    if (status) {
      query.status = status;
    }
    if (isFeatured) {
      query.isFeatured = isFeatured === "true";
    }

    // search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // count total
    const total = await Blog.countDocuments(query);

    // pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      blogs,
    });
  } catch (error) {
    console.error("getAllBlogs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.commentOnBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const newComment = {
      user: req.user.id, // assuming auth middleware fills req.user
      name: req.user.name,
      comment: comment,
      createdAt: new Date(),
    };

    // push into comments array
    blog.comments.push(newComment);

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comments: blog.comments,
    });
  } catch (error) {
    console.error("commentOnBlog error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // find comment
    const comment = blog.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // allow only owner or admin
    if (
      comment.user.toString() !== req.user.id &&
      req.user.accountType !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // filter out the comment
    blog.comments = blog.comments.filter((c) => c._id.toString() !== commentId);

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("deleteComment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// views add in getSingle blog by id
// exports.incrementViews = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const blog = await Blog.findByIdAndUpdate(
//       id,
//       { $inc: { views: 1 } },
//       { new: true }
//     );

//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: "Blog not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Views incremented",
//       views: blog.views,
//     });
//   } catch (error) {
//     console.error("incrementViews error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };