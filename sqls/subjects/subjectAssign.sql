IF EXISTS (SELECT *
FROM sysobjects
WHERE type = 'P' AND name = 'subjectAssign')
	BEGIN
  DROP  Procedure  subjectAssign
END
GO

CREATE PROCEDURE [dbo].subjectAssign(
  @subjectId  INT,
  @userId     INT,
  @assignedBy INT,
  @status     TINYINT
)
AS
BEGIN
  SET NOCOUNT ON

  DECLARE
    @now DATETIME2 = GETDATE()

  BEGIN TRANSACTION

  UPDATE  UserSubjects
  SET     revoked = 1,
          revokedBy = @assignedBy,
          revokedOn = @now
  WHERE   userId = @userId
      AND subjectId = @subjectId
      AND revoked = 0

  IF @@ERROR > 0
  BEGIN
    ROLLBACK TRANSACTION
    RETURN -1
  END

  INSERT INTO [UserSubjects](userId, subjectId, assignedBy, assignedOn, [status])
  VALUES (@userId, @subjectId, @assignedBy, @now, @status)

  IF @@ERROR > 0
  BEGIN
    ROLLBACK TRANSACTION
    RETURN -2
  END

  UPDATE  [Subject]
  SET     assignedTo = @userId,
          [status] = @status
  WHERE   id = @subjectId

  IF @@ERROR > 0
  BEGIN
    ROLLBACK TRANSACTION
    RETURN -3
  END

  COMMIT TRANSACTION
END
GO
GRANT EXEC ON [dbo].subjectAssign TO rpb_role
GO