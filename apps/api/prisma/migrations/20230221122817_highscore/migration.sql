-- CreateTable
CREATE TABLE "Highscore" (
    "hash" VARCHAR(100) NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Highscore_pkey" PRIMARY KEY ("hash","userId")
);

-- AddForeignKey
ALTER TABLE "Highscore" ADD CONSTRAINT "Highscore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
