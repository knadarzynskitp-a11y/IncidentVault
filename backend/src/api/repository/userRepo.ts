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


export async function findEvidenceById(evidence_id: number) {
    const result = await pool.query(
        "SELECT id, lawsuit_id FROM evidences WHERE id = $1",
        [evidence_id]
    );

    return result.rows[0];
}

export type EvidenceFileData = {
    evidence_id: number;
    uploaded_by: number;
    original_name: string;
    storage_key: string;
    mime_type: string;
    size_bytes: number;
    sha256_hash: string;
};

export async function addEvidenceFile(data: EvidenceFileData) {
    const result = await pool.query(
        `INSERT INTO files_evidences (evidence_id, uploaded_by, original_name, storage_key, mime_type, size_bytes, sha256_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [data.evidence_id, data.uploaded_by, data.original_name, data.storage_key, data.mime_type, data.size_bytes, data.sha256_hash]
    );

    return result.rows[0]!;
}

export async function takeLawsuits(user_id: number)
{
    const result = await pool.query(
        "SELECT l.id, l.tytul FROM lawsuit AS l JOIN is_part_of_lawsuit AS p ON l.id=p.lawsuit_id WHERE p.user_id=$1 ORDER BY l.created_at DESC",
        [user_id]
    );
    return result.rows;
}

export async function takeLawsuit(lawsuit_id: number)
{
    const result = await pool.query(
        "SELECT id, tytul, opis FROM lawsuit WHERE id=$1",
        [lawsuit_id]
    );
    return result.rows[0];
}

export async function takeLawsuit2(lawsuit_id: number)
{
    const result = await pool.query(
        "SELECT id, name, opis FROM evidences WHERE lawsuit_id=$1",
        [lawsuit_id]
    );
    return result.rows;
}

export async function takeEvidence(evidence_id: number)
{
    const result = await pool.query(
        "SELECT * FROM evidences WHERE id=$1",
        [evidence_id]
    );

    return result.rows[0];
}