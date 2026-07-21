


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."arima_predictions" (
    "id" integer NOT NULL,
    "forecast_date" "date" NOT NULL,
    "predicted_return" numeric(12,8),
    "predicted_rate" numeric(10,6),
    "confidence_interval_lower" numeric(10,6),
    "confidence_interval_upper" numeric(10,6),
    "actual_return" numeric(12,8),
    "actual_rate" numeric(10,6),
    "mae" numeric(12,8),
    "rmse" numeric(12,8),
    "mape" numeric(12,8),
    "arima_order" character varying(20),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."arima_predictions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."arima_predictions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."arima_predictions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."arima_predictions_id_seq" OWNED BY "public"."arima_predictions"."id";



CREATE TABLE IF NOT EXISTS "public"."exchange_rates" (
    "id" integer NOT NULL,
    "date" "date" NOT NULL,
    "open" numeric(10,6) NOT NULL,
    "high" numeric(10,6) NOT NULL,
    "low" numeric(10,6) NOT NULL,
    "close" numeric(10,6) NOT NULL,
    "volume" bigint,
    "log_return" numeric(12,8),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."exchange_rates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."exchange_rates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."exchange_rates_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."exchange_rates_id_seq" OWNED BY "public"."exchange_rates"."id";



CREATE TABLE IF NOT EXISTS "public"."garch_volatility" (
    "id" integer NOT NULL,
    "date" "date" NOT NULL,
    "conditional_variance" numeric(12,8),
    "conditional_std" numeric(12,8),
    "standardized_residuals" numeric(12,8),
    "garch_order" character varying(20),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."garch_volatility" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."garch_volatility_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."garch_volatility_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."garch_volatility_id_seq" OWNED BY "public"."garch_volatility"."id";



CREATE TABLE IF NOT EXISTS "public"."hybrid_predictions" (
    "id" integer NOT NULL,
    "forecast_date" "date" NOT NULL,
    "arima_component" numeric(12,8),
    "garch_component" numeric(12,8),
    "lstm_component" numeric(12,8),
    "combined_prediction" numeric(10,6),
    "confidence_lower" numeric(10,6),
    "confidence_upper" numeric(10,6),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."hybrid_predictions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."hybrid_predictions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."hybrid_predictions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."hybrid_predictions_id_seq" OWNED BY "public"."hybrid_predictions"."id";



CREATE TABLE IF NOT EXISTS "public"."lstm_predictions" (
    "id" integer NOT NULL,
    "forecast_date" "date" NOT NULL,
    "predicted_return" numeric(12,8),
    "predicted_rate" numeric(10,6),
    "actual_return" numeric(12,8),
    "actual_rate" numeric(10,6),
    "mae" numeric(12,8),
    "rmse" numeric(12,8),
    "mape" numeric(12,8),
    "model_epoch" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."lstm_predictions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."lstm_predictions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."lstm_predictions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."lstm_predictions_id_seq" OWNED BY "public"."lstm_predictions"."id";



CREATE TABLE IF NOT EXISTS "public"."macro_indicators" (
    "id" integer NOT NULL,
    "date" "date" NOT NULL,
    "indicator_type" character varying(50),
    "value" numeric(10,6),
    "source" character varying(100),
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."macro_indicators" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."macro_indicators_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."macro_indicators_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."macro_indicators_id_seq" OWNED BY "public"."macro_indicators"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."arima_predictions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."arima_predictions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."exchange_rates" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."exchange_rates_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."garch_volatility" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."garch_volatility_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."hybrid_predictions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."hybrid_predictions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."lstm_predictions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."lstm_predictions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."macro_indicators" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."macro_indicators_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."arima_predictions"
    ADD CONSTRAINT "arima_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exchange_rates"
    ADD CONSTRAINT "exchange_rates_date_key" UNIQUE ("date");



ALTER TABLE ONLY "public"."exchange_rates"
    ADD CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."garch_volatility"
    ADD CONSTRAINT "garch_volatility_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hybrid_predictions"
    ADD CONSTRAINT "hybrid_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lstm_predictions"
    ADD CONSTRAINT "lstm_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."macro_indicators"
    ADD CONSTRAINT "macro_indicators_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_arima_predictions_date" ON "public"."arima_predictions" USING "btree" ("forecast_date" DESC);



CREATE INDEX "idx_exchange_rates_date" ON "public"."exchange_rates" USING "btree" ("date" DESC);



CREATE INDEX "idx_garch_volatility_date" ON "public"."garch_volatility" USING "btree" ("date" DESC);



CREATE INDEX "idx_hybrid_predictions_date" ON "public"."hybrid_predictions" USING "btree" ("forecast_date" DESC);



CREATE INDEX "idx_lstm_predictions_date" ON "public"."lstm_predictions" USING "btree" ("forecast_date" DESC);



CREATE INDEX "idx_macro_indicators_date" ON "public"."macro_indicators" USING "btree" ("date" DESC);



CREATE INDEX "idx_macro_indicators_type" ON "public"."macro_indicators" USING "btree" ("indicator_type");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



























GRANT ALL ON TABLE "public"."arima_predictions" TO "anon";
GRANT ALL ON TABLE "public"."arima_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."arima_predictions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."arima_predictions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."arima_predictions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."arima_predictions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exchange_rates" TO "anon";
GRANT ALL ON TABLE "public"."exchange_rates" TO "authenticated";
GRANT ALL ON TABLE "public"."exchange_rates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exchange_rates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exchange_rates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exchange_rates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."garch_volatility" TO "anon";
GRANT ALL ON TABLE "public"."garch_volatility" TO "authenticated";
GRANT ALL ON TABLE "public"."garch_volatility" TO "service_role";



GRANT ALL ON SEQUENCE "public"."garch_volatility_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."garch_volatility_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."garch_volatility_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."hybrid_predictions" TO "anon";
GRANT ALL ON TABLE "public"."hybrid_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."hybrid_predictions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hybrid_predictions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hybrid_predictions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hybrid_predictions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."lstm_predictions" TO "anon";
GRANT ALL ON TABLE "public"."lstm_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."lstm_predictions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."lstm_predictions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lstm_predictions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lstm_predictions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."macro_indicators" TO "anon";
GRANT ALL ON TABLE "public"."macro_indicators" TO "authenticated";
GRANT ALL ON TABLE "public"."macro_indicators" TO "service_role";



GRANT ALL ON SEQUENCE "public"."macro_indicators_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."macro_indicators_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."macro_indicators_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































