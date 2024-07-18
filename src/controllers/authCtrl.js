import passport from "passport";
import AsyncHandler from "express-async-handler";
import { User } from "../models/UserModel.js";
import { frontendUrls, pageSize } from "../constants.js";
import { GetComplaintId } from "../utils/getCompliantId.js";

// User authentication
export const Userauth = (req, res, next) => {
  try {
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })(req, res, next);
  } catch (error) {
    console.log(error);
  }
};

export const UserCallBack = (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: frontendUrls.home,
    failureRedirect: frontendUrls.loginError,
    failWithError: true,
  })(req, res, next);
};
//User Logout
export const UserLogout = (req, res) => {
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        // return res.json({
        //   success: false,
        //   message: "Could not log out, please try again",
        // });
        // console.log('cant logout user')
      } else {
        res.clearCookie("connect.sid");
      }
      return res.redirect(frontendUrls.home);
    });
  });
};

const toogleBlock = async (id, res, value) => {
  const result = await User.updateOne({ googleId: id }, { IsBlock: value });

  if (result.modifiedCount) throw new Error("Cannot able to unblock user");
  return res.status(200).json({
    status: "success",
    message: "User unblocked successfully",
  });
};

//Block User by admin
export const BlockUser = AsyncHandler(async (req, res) => {
  return await toogleBlock(req.params.id, res, true);
});

//Unblock User by admin
export const unblockUser = AsyncHandler(async (req, res) => {
  return await toogleBlock(req.params.id, res, false);
});


export const createUser = AsyncHandler(async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) throw new Error("Invalid request");
  const parsedRole = parseInt(role);
  const domain = req.body.domain ? parseInt(req.body.domain) : undefined;
  const options = {
    domain,
    email,
    userType: parsedRole,
    googleId: GetComplaintId(),
    flag: true,
  };
  const user = await User.findOne({ email });
  if (user) throw new Error("User already exists");
  await User.create(options);
  res.status(200).json({
    status: "success",
    message: "User created successfully",
  });
  res.status(400).json({
    status: "failed",
    message: "User not created",
  });
});

//User Information access by admin
export const getUser = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ googleId: id });
  if (!user) {
    throw new Error("Invalid Id,Please try Again!");
  }
  res.json(user);
});

const formatUser = (user, googleUser) => {
  const _user = user.toObject();

  const role = user.userType;
  delete _user.userType;
  delete _user.__v;
  delete _user._id;
  delete _user.createdAt;
  delete _user.updatedAt;
  delete _user.googleId;
  return {
    ..._user,
    role,
    image: googleUser.photos[0].value,
  };
};

export const pingUser = AsyncHandler(async (req, res) => {
  console.log('====================================');
  console.log(req.session())
  console.log('====================================');
  console.log(req.cookies())

  if (req.user) {
    const user = await User.findOne({ googleId: req.user.id });
    res.json(formatUser(user, req.user));
  } else {
    console.log("user Not found");
    res.status(401).json({ message: "User not found" });
  }
});

const userQuery = async (page, filter = {}, sortFilter = { createdAt: 1 }) => {
  return await User.find(filter)
    .sort(sortFilter)
    .skip(pageSize * (page - 1))
    .limit(pageSize);
};

const formatUserPreview = (user) => {
  const {
    displayName,
    email,
    userType: role,
    isBlocked,
    domain,
    rollNo,
  } = user;
  return {
    displayName,
    email,
    role,
    isBlocked,
    domain,
    rollNo,
  };
};

//All User Information access by admin
export const getUsers = AsyncHandler(async (req, res) => {
  const { suburl } = req.params;
  const { page } = req.query;
  const parsedPage = parseInt(page);
  if (!suburl) return res.status(400).json({ message: "Invalid URL" });
  let users = [];
  if (suburl === "all") {
    users = await userQuery(parsedPage);
    return res.json({
      users,
      nextPage: users.length === pageSize ? parsedPage + 1 : null,
    });
  } else {
    const parsedSuburl = parseInt(suburl);
    users = await userQuery(parsedPage, { userType: parsedSuburl });
  }

  users = users.map(formatUserPreview);

  return res.json({
    users,
    nextPage: users.length === pageSize ? parsedPage + 1 : null,
  });
});