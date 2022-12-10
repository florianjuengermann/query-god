DROP SCHEMA IF EXISTS "public" CASCADE;
CREATE SCHEMA "public";

CREATE TABLE "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "payment_status" "text" NOT NULL,
    "ios_id" "text" NOT NULL,
    "fcm_token" "text" NOT NULL,
    "credits" bigint DEFAULT '0'::bigint,
    "finetune_access" boolean DEFAULT false,
    "experiment" "text"
);



CREATE TABLE "public"."templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text" NOT NULL,
    "example_images" "jsonb" NOT NULL,
    "type" "text" NOT NULL,
    "settings" "jsonb" NOT NULL,
    "gender" "text" DEFAULT 'both'::"text",
    "is_bestof" boolean DEFAULT false NOT NULL,
    "example_images_male" "jsonb",
    "example_images_female" "jsonb"
);



CREATE TABLE "public"."models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "training_images" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" NOT NULL,
    "estimated_time_to_completion" timestamp with time zone,
    "model_name" "text" NOT NULL,
    "gender" "text" DEFAULT 'both'::"text",
    "face_attributes" "jsonb"
);



CREATE TABLE "public"."generations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "input" "jsonb" NOT NULL,
    "status" "text" NOT NULL,
    "output" "jsonb",
    "template_id" "uuid" NOT NULL,
    "model_id" "uuid" NOT NULL,
    "output_no_wm" "jsonb",
    "num_retries" int4 DEFAULT 0 NOT NULL
);

-- SEED DATA

INSERT INTO "public"."users" ("id", "email", "payment_status", "ios_id", "fcm_token", "credits", "finetune_access", "experiment") VALUES (
    '00000000-0000-0000-0000-000000000000',
    'test@gmail.com',
    'paid',
    'ABCD-1234-ABCD-1234',
    'acf5d3f4-5d3f-4acf-5d3f-4acf5d3f4acf',
    100,
    true,
    null
);