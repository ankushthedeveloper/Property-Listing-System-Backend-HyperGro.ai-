import { Request, Response } from "express";
import { ApiResponse } from "@utils/apiResponse";
import { StatusCode } from "@constants/common.constants";

export const serveRoot = async (req: Request, res: Response) => {
  return new ApiResponse(
    StatusCode.SUCCESS,
    {
      name: "Real Estate Property API",
      version: "1.0.0",
      description:
        "A RESTful API to manage properties, favorites, and recommendations",
      health: {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      endpoints: {
        auth: {
          register: {
            method: "POST",
            path: "/api/v1/users/register",
            description: "Register new user",
          },
          login: {
            method: "POST",
            path: "/api/v1/users/login",
            description: "Authenticate user",
          },
        },
        properties: {
          create: {
            method: "POST",
            path: "/api/v1/properties",
            description: "Create property",
          },
          getAll: {
            method: "GET",
            path: "/api/v1/properties",
            description: "List/search properties",
          },
          getOne: {
            method: "GET",
            path: "/api/v1/properties/update/:propertyId",
            description: "Get single property",
          },
          update: {
            method: "PUT",
            path: "/api/v1/properties/delete/:propertyId",
            description: "Update property",
          },
          delete: {
            method: "DELETE",
            path: "/api/v1/properties/:id",
            description: "Delete property",
          },
        },
        favorites: {
          create: {
            method: "POST",
            path: "/api/v1/favorites/create",
            description: "Create property as favorite",
          },
          get: {
            method: "GET",
            path: "/api/v1/favorites",
            description: "List user favorites (filters)",
          },
          update: {
            method: "PATCH",
            path: "/api/v1/favorites/update/:favoriteId",
            description: "Update priority/label",
          },
          delete: {
            method: "DELETE",
            path: "/api/v1/favorites/delete/:favoriteId",
            description: "Remove from favorites",
          },
        },
        recommendations: {
          create: {
            method: "POST",
            path: "/api/v1/recommendations/create",
            description: "Recommend property to a user",
          },
          get: {
            method: "GET",
            path: "/api/v1/recommendations",
            description: "View sent/received recommendations",
          },
          update: {
            method: "PATCH",
            path: "/api/v1/recommendations/update/:recommendationId",
            description: "Update recommendation note",
          },
          delete: {
            method: "DELETE",
            path: "/api/v1/recommendations/delete/:recommendationId",
            description: "Delete recommendation",
          },
        },
      },
      docs: "Coming soon...",
    },
    {},
    "Welcome to the Real Estate Property API!"
  ).send(res);
};
