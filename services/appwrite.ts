//track the searches made by a user
import { Client, Query, TablesDB } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new TablesDB(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", query)],
    });

    //check if the search already exists in the database
    if (result.rows.length > 0) {
      const existingMovie = result.rows[0];
      await database.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: existingMovie.$id,
        data: {
          count: existingMovie.count + 1,
        },
      });
    } else {
      await database.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: "unique()",
        data: {
          searchTerm: query,
          movie_id: movie?.id,
          count: 1,
          title: movie?.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }

  //if a document is found increment the searchCount field
  //if no document is found create a new document in Appwrite database
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc("count")],
    });

    return result.rows as unknown as TrendingMovie[];

  } catch (error) {
    console.log(error);
    return undefined;
  }
};
