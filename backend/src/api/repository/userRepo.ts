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

export async function checkUser(lawsuit_id: number, user_id: number)
{
    const result = await pool.query(
        "SELECT role FROM is_part_of_lawsuit WHERE lawsuit_id=$1 AND user_id=$2",
        [lawsuit_id, user_id]
    );
    return result.rows[0];
}

export async function addMemberToLawsuit(lawsuit_id: number, member_id: number, role: string)
{
    await pool.query(
        "INSERT INTO is_part_of_lawsuit (lawsuit_id, user_id, role) VALUES ($1, $2, $3)",
        [lawsuit_id, member_id, role]
    )
}

export async function addEvidence(user_id: number, lawsuit_id: number, name: string, opis: string)
{
    await pool.query(
        "INSERT INTO evidences (user_id, lawsuit_id, name, opis) VALUES ($1, $2, $3, $4)",
        [user_id, lawsuit_id, name, opis]
    );
}

/*
export async function findEvidenceById(evidence_id: number) {
    const result = await pool.query(
        "SELECT id, lawsuit_id FROM evidences WHERE id = $1",
        [evidence_id]
    );

    return result.rows[0];
}*/