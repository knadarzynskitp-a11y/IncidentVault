import {pool} from "../../config/db.js"

export async function addLawsuitTransaction(user_id: number, tytul: string, opis: string)
{
    const client = await pool.connect();

    try
    {
        await client.query("BEGIN");

        const result = await client.query(
            "INSERT INTO lawsuit (tytul, opis) VALUES ($1, $2) RETURNING id",
            [tytul, opis]
        );

        const lawsuit_id = result.rows[0].id;

        await client.query(
            "INSERT INTO is_part_of_lawsuit (lawsuit_id, user_id, role) VALUES ($1, $2, $3)",
            [lawsuit_id, user_id, "Leader"]
        );

        await client.query("COMMIT");
    }
    catch(err)
    {
        await client.query("ROLLBACK");
        throw err;
    }
    finally
    {
        client.release()
    }
}