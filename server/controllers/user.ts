import { Request, Response } from "express";
import { z } from "zod";
import * as userModel from "../models/user.js";
import * as userProviderModel from "../models/userProvider.js";
import signJWT, { EXPIRE_TIME } from "../utils/signJWT.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  secure: true,
  sameSite: "strict",
} as const;

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const userId = await userModel.createUser(email, name);
    await userProviderModel.createNativeProvider(userId, password);
    const token = await signJWT(userId);
    res
      .cookie("jwtToken", token, COOKIE_OPTIONS)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            id: userId,
            provider: userProviderModel.PROVIDER.NATIVE,
            name,
            email,
            picture: `https://d1a26cbu5iquck.cloudfront.net/userImage/default.png`,
          },
        },
      });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "sign up failed" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUser(email);
    if (!user) {
      throw new Error("user not exist");
    }
    const isValidPassword = await userProviderModel.checkNativeProviderToken(
      user.id,
      password
    );
    if (!isValidPassword) {
      throw new Error("invalid password");
    }
    const token = await signJWT(user.id);
    res
      .cookie("jwtToken", token, COOKIE_OPTIONS)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            ...user,
            picture: `https://d1a26cbu5iquck.cloudfront.net/${user.picture}`,
            provider: userProviderModel.PROVIDER.NATIVE,
          },
        },
      });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "sign in failed" });
  }
};

const ProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  picture: z.object({
    data: z.object({
      url: z.string(),
    }),
  }),
});

const getFbProfileData = async (userToken: string) => {
  const response = await fetch(
    `https://graph.facebook.com/v16.0/me?fields=id,name,email,picture&access_token=${userToken}`
  );
  const profile = ProfileSchema.parse(response.json());
  return profile;
};

export const fbLogin = async (req: Request, res: Response) => {
  try {
    const { access_token: userToken } = req.body;
    const profile = await getFbProfileData(userToken);

    const user = await userModel.findUser(profile.email);

    if (!user) {
      const userId = await userModel.createUser(profile.email, profile.name);
      await userProviderModel.createFbProvider(userId, profile.id);
      const token = await signJWT(userId);
      res
        .cookie("jwtToken", token, COOKIE_OPTIONS)
        .status(200)
        .json({
          data: {
            access_token: token,
            access_expired: EXPIRE_TIME,
            user: {
              id: userId,
              name: profile.name,
              email: profile.email,
              picture: profile.picture.data.url,
              provider: userProviderModel.PROVIDER.FACEBOOK,
            },
          },
        });
      return;
    }
    const provider = await userProviderModel.findFbProvider(user.id);
    if (!provider) {
      await userProviderModel.createFbProvider(user.id, profile.id);
    }
    if (provider.token !== profile.id) {
      throw new Error("user id and provider token not match");
    }
    const token = await signJWT(user.id);
    res
      .cookie("jwtToken", token, COOKIE_OPTIONS)
      .status(200)
      .json({
        data: {
          access_token: token,
          access_expired: EXPIRE_TIME,
          user: {
            ...user,
            picture: profile.picture.data.url,
            provider: userProviderModel.PROVIDER.FACEBOOK,
          },
        },
      });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "fb login failed" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const user = await userModel.findUserById(userId);
    res.status(200).json({ data: user });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "get profile failed" });
  }
};
