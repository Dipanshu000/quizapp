"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, User, RotateCcw } from "lucide-react"

interface Question {
  id: number
  question: string
  choices: string[]
  correctAnswer: string
  userAnswer: string | null
  visited: boolean
  attempted: boolean
}

export default function ResultsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [email, setEmail] = useState("")
  const [score, setScore] = useState(0)
  const [completionTime, setCompletionTime] = useState("")
  const router = useRouter()

  useEffect(() => {
    const storedEmail = localStorage.getItem("quizEmail")
    const storedQuestions = localStorage.getItem("quizQuestions")
    const startTime = localStorage.getItem("quizStartTime")
    const completed = localStorage.getItem("quizCompleted")

    if (!storedEmail || !storedQuestions || !startTime || !completed) {
      router.push("/")
      return
    }

    setEmail(storedEmail)
    const parsedQuestions = JSON.parse(storedQuestions)
    setQuestions(parsedQuestions)

    // Calculate score
    const correctAnswers = parsedQuestions.filter((q: Question) => q.userAnswer === q.correctAnswer).length
    setScore(correctAnswers)

    // Calculate completion time
    const elapsed = Math.floor((Date.now() - Number.parseInt(startTime)) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    setCompletionTime(`${minutes}m ${seconds}s`)
  }, [router])

  const handleRetakeQuiz = () => {
    localStorage.clear()
    router.push("/")
  }

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const percentage = Math.round((score / questions.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">CausalFunnel Quiz Results</h1>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {email}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Completed in {completionTime}
              </div>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-2xl text-gray-600 mb-4">{percentage}%</div>
              <Badge
                variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"}
                className="text-lg px-4 py-1"
              >
                {percentage >= 70 ? "Excellent!" : percentage >= 50 ? "Good Job!" : "Keep Learning!"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Detailed Results</h2>
            <Button onClick={handleRetakeQuiz} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </div>

          {questions.map((question, index) => {
            const isCorrect = question.userAnswer === question.correctAnswer
            const wasAttempted = question.userAnswer !== null

            return (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Question {index + 1}
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </CardTitle>
                    <Badge variant={isCorrect ? "default" : "destructive"}>
                      {isCorrect ? "Correct" : wasAttempted ? "Incorrect" : "Not Answered"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="font-medium" dangerouslySetInnerHTML={{ __html: question.question }} />

                  <div className="grid gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Your Answer:</h4>
                        <div
                          className={`p-3 rounded-lg border ${
                            !wasAttempted
                              ? "bg-gray-100 text-gray-500"
                              : isCorrect
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "bg-red-50 border-red-200 text-red-800"
                          }`}
                        >
                          {wasAttempted ? (
                            <span dangerouslySetInnerHTML={{ __html: question.userAnswer! }} />
                          ) : (
                            "No answer provided"
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-600 mb-2">Correct Answer:</h4>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                          <span dangerouslySetInnerHTML={{ __html: question.correctAnswer }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}


// Main files are app/page.tsx, app/api/questions , app/quiz , app/results 