/*
 Pipeline d'aggrégation pour les requètes plus complexes.
*/

/*
Renvoie les {limit} plus proches spot du point [lon,lat]
*/
export const aggregateSpotByLocation = (lon, lat, limit = null) => [
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [lat, lon],
      },
      distanceField: "distance",
      spherical: true,
    },
  },
  {
    $limit: limit ?? 10,
  },
  {
    $unwind: {
      path: "$videos",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "videos",
      localField: "videos",
      foreignField: "_id",
      as: "videos",
    },
  },
  {
    $group: {
      _id: "$_id",
      creationDate: {
        $first: "$creationDate",
      },
      name: {
        $first: "$name",
      },
      location: {
        $first: "$location",
      },
      category: {
        $first: "$category",
      },
      img: {
        $first: "$img",
      },
      creator: {
        $first: "$creator",
      },
      distance: {
        $first: "$distance",
      },
      videos: {
        $push: "$videos",
      },
    },
  },
  {
    $addFields: {
      videos: {
        $reduce: {
          input: "$videos",
          initialValue: [],
          in: {
            $concatArrays: ["$$value", "$$this"],
          },
        },
      },
    },
  },
  {
    $addFields: {
      videos: {
        $sortArray: {
          input: "$videos",
          sortBy: {
            voteCount: -1,
          },
        },
      },
    },
  },
  {
    $sort: {
      distance: 1,
    },
  },
];
